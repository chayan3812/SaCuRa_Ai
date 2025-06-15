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

  constructor() {
    if (!PAGE_ID || !ACCESS_TOKEN) {
      console.warn('Facebook API credentials not fully configured');
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
        access_token: ACCESS_TOKEN
      });

      return response.data;
    } catch (error: any) {
      console.error('Facebook media upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload media: ${error.response?.data?.error?.message || error.message}`);
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