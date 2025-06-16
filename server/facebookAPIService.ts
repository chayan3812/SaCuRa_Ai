/**
 * Facebook Graph API Service
 * Production-ready Facebook integration with comprehensive features
 */

import axios from 'axios';

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const API_VERSION = 'v21.0'; // Using latest stable version

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface PageInsights {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time: string;
  }>;
}

interface PublishPostData {
  message: string;
  link?: string;
  picture?: string;
  scheduled_publish_time?: number;
}

export class FacebookAPIService {
  private baseUrl = `https://graph.facebook.com/${API_VERSION}`;
  private accessToken: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || ACCESS_TOKEN || '';
    if (!this.accessToken) {
      console.warn('Facebook API credentials not configured');
    }
  }

  async getPages(): Promise<any[]> {
    try {
      if (!this.accessToken) {
        throw new Error('Facebook access token not configured');
      }

      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,access_token,category,follower_count'
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook getPages error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch pages: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'id,name'
        }
      });

      return {
        valid: true
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.error?.message || 'Invalid credentials'
      };
    }
  }

  async fetchPageInsights(metrics: string[] = ['page_impressions', 'page_engaged_users']): Promise<PageInsights[]> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const metricsParam = metrics.join(',');
      const response = await axios.get(`${this.baseUrl}/${PAGE_ID}/insights/${metricsParam}`, {
        params: {
          access_token: ACCESS_TOKEN,
          period: 'day',
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0]
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook insights error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch page insights: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async publishPost(postData: PublishPostData): Promise<{ id: string; post_id?: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const response = await axios.post(`${this.baseUrl}/${PAGE_ID}/feed`, {
        ...postData,
        access_token: ACCESS_TOKEN
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook post error:', error.response?.data || error.message);
      throw new Error(`Failed to publish post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPost(userId: string, postData: { message: string; image?: string; scheduledTime?: Date }): Promise<{ id: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const publishData: PublishPostData = {
        message: postData.message,
        picture: postData.image
      };

      if (postData.scheduledTime) {
        publishData.scheduled_publish_time = Math.floor(postData.scheduledTime.getTime() / 1000);
      }

      const response = await axios.post(`${this.baseUrl}/${PAGE_ID}/feed`, {
        ...publishData,
        access_token: ACCESS_TOKEN
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook createPost error:', error.response?.data || error.message);
      throw new Error(`Failed to create post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getRecentPosts(limit: number = 10): Promise<FacebookPost[]> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const response = await axios.get(`${this.baseUrl}/${PAGE_ID}/posts`, {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook posts error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch posts: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPageInfo(): Promise<any> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const response = await axios.get(`${this.baseUrl}/${PAGE_ID}`, {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'id,name,about,category,fan_count,link,picture,cover,website'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook page info error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch page info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPostEngagement(postId: string): Promise<any> {
    try {
      if (!ACCESS_TOKEN) {
        throw new Error('Facebook access token not configured');
      }

      const response = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          access_token: ACCESS_TOKEN,
          fields: 'insights.metric(post_impressions,post_engaged_users,post_clicks)'
        }
      });

      return response.data.insights?.data || [];
    } catch (error: any) {
      console.error('Facebook post engagement error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch post engagement: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async uploadMedia(imageUrl: string, caption?: string): Promise<{ id: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const response = await axios.post(`${this.baseUrl}/${PAGE_ID}/photos`, {
        url: imageUrl,
        caption: caption || '',
        published: false, // Upload but don't publish immediately
        access_token: ACCESS_TOKEN
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook media upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload media: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createCarouselPost(message: string, cards: Array<{
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
  }>): Promise<{ id: string; post_id?: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      // Upload images for carousel cards
      const childAttachments = await Promise.all(
        cards.map(async (card) => {
          const photoResponse = await axios.post(`${this.baseUrl}/${PAGE_ID}/photos`, {
            url: card.imageUrl,
            published: false,
            access_token: ACCESS_TOKEN
          });

          return {
            name: card.title,
            description: card.description,
            link: card.linkUrl,
            picture: card.imageUrl,
            media_fbid: photoResponse.data.id
          };
        })
      );

      const response = await axios.post(`${this.baseUrl}/${PAGE_ID}/feed`, {
        message,
        child_attachments: childAttachments,
        access_token: ACCESS_TOKEN
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook carousel post error:', error.response?.data || error.message);
      throw new Error(`Failed to create carousel post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createLinkPost(message: string, linkUrl: string, linkData?: {
    title?: string;
    description?: string;
    imageUrl?: string;
  }): Promise<{ id: string; post_id?: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const postData: any = {
        message,
        link: linkUrl,
        access_token: ACCESS_TOKEN
      };

      if (linkData?.title) postData.name = linkData.title;
      if (linkData?.description) postData.description = linkData.description;
      if (linkData?.imageUrl) postData.picture = linkData.imageUrl;

      const response = await axios.post(`${this.baseUrl}/${PAGE_ID}/feed`, postData);

      return response.data;
    } catch (error: any) {
      console.error('Facebook link post error:', error.response?.data || error.message);
      throw new Error(`Failed to create link post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async uploadPhotoPost(fileBuffer: Buffer, mimeType: string, caption: string): Promise<{ id: string; post_id?: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const url = `https://graph.facebook.com/${API_VERSION}/${PAGE_ID}/photos`;
      const FormData = require('form-data');
      const form = new FormData();
      
      form.append("access_token", ACCESS_TOKEN);
      form.append("caption", caption);
      form.append("source", fileBuffer, {
        filename: "image.jpg",
        contentType: mimeType
      });

      const response = await axios.post(url, form, {
        headers: form.getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook photo upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload photo: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getLinkPreview(url: string): Promise<{ title: string; description: string; image: string; url: string }> {
    try {
      // Use a web scraping approach for link previews
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SaCuRa-AI/1.0)'
        },
        timeout: 10000
      });

      const html = response.data;
      
      // Extract Open Graph meta tags
      const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/) || 
                        html.match(/<title[^>]*>([^<]*)<\/title>/);
      const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/) || 
                       html.match(/<meta name="description" content="([^"]*)"/) ||
                       html.match(/<meta property="description" content="([^"]*)"/);
      const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/) ||
                        html.match(/<meta name="image" content="([^"]*)"/);

      return {
        title: titleMatch ? titleMatch[1].substring(0, 100) : 'Link Preview',
        description: descMatch ? descMatch[1].substring(0, 200) : 'Click to view content',
        image: imageMatch ? imageMatch[1] : '',
        url: url
      };
    } catch (error: any) {
      console.error('Link preview error:', error.message);
      
      // Return a basic preview if scraping fails
      const domain = new URL(url).hostname;
      return {
        title: `Link from ${domain}`,
        description: 'Click to view content',
        image: '',
        url: url
      };
    }
  }

  async generateLinkPreview(url: string): Promise<{ title?: string; description?: string; image?: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/`, {
        params: {
          id: url,
          scrape: true,
          access_token: ACCESS_TOKEN
        }
      });

      return {
        title: response.data.title,
        description: response.data.description,
        image: response.data.image?.[0]?.url
      };
    } catch (error: any) {
      console.error('Link preview error:', error.response?.data || error.message);
      return {};
    }
  }

  async schedulePost(postData: PublishPostData, publishTime: Date): Promise<{ id: string }> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const scheduledPostData = {
        ...postData,
        published: false,
        scheduled_publish_time: Math.floor(publishTime.getTime() / 1000),
        access_token: ACCESS_TOKEN
      };

      const response = await axios.post(`${this.baseUrl}/${PAGE_ID}/feed`, scheduledPostData);

      return response.data;
    } catch (error: any) {
      console.error('Facebook schedule post error:', error.response?.data || error.message);
      throw new Error(`Failed to schedule post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getAudienceInsights(): Promise<any> {
    try {
      if (!PAGE_ID || !ACCESS_TOKEN) {
        throw new Error('Facebook credentials not configured');
      }

      const response = await axios.get(`${this.baseUrl}/${PAGE_ID}/insights`, {
        params: {
          access_token: ACCESS_TOKEN,
          metric: 'page_fans_country,page_fans_city,page_fans_gender_age',
          period: 'lifetime'
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook audience insights error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch audience insights: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    try {
      if (!ACCESS_TOKEN) {
        throw new Error('Facebook access token not configured');
      }

      await axios.delete(`${this.baseUrl}/${postId}`, {
        params: {
          access_token: ACCESS_TOKEN
        }
      });

      return { success: true };
    } catch (error: any) {
      console.error('Facebook delete post error:', error.response?.data || error.message);
      throw new Error(`Failed to delete post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      if (!APP_ID || !APP_SECRET) {
        throw new Error('Facebook App credentials not configured');
      }

      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: shortLivedToken
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook token exchange error:', error.response?.data || error.message);
      throw new Error(`Failed to get long-lived token: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPageAccessToken(userAccessToken: string): Promise<{ access_token: string; id: string; name: string }[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: userAccessToken
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Facebook page token error:', error.response?.data || error.message);
      throw new Error(`Failed to get page access token: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export const facebookAPI = new FacebookAPIService();