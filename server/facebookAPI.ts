import axios from 'axios';

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  about?: string;
  can_post: boolean;
  posts?: any[];
  picture?: {
    data: {
      url: string;
    };
  };
  follower_count?: number;
  restrictions?: any[];
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  likes?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  comments?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

export interface FacebookInsights {
  page_fans: number;
  page_impressions: number;
  page_post_engagements: number;
  page_views: number;
}

export class FacebookAPIService {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private pageAccessToken: string;

  constructor(pageAccessToken: string) {
    this.pageAccessToken = pageAccessToken;
  }

  async getPages(): Promise<FacebookPage[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,name,access_token,category,about,can_post,picture,fan_count'
        }
      });

      return response.data.data.map((page: any) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
        about: page.about,
        can_post: page.can_post,
        picture: page.picture,
        follower_count: page.fan_count,
        restrictions: []
      }));
    } catch (error) {
      console.error('Facebook API - Get Pages Error:', error);
      throw new Error(`Failed to fetch Facebook pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPageInfo(pageId: string): Promise<FacebookPage> {
    try {
      const response = await axios.get(`${this.baseUrl}/${pageId}`, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,name,category,about,can_post,picture,fan_count'
        }
      });

      const page = response.data;
      return {
        id: page.id,
        name: page.name,
        access_token: this.pageAccessToken,
        category: page.category,
        about: page.about,
        can_post: page.can_post,
        picture: page.picture,
        follower_count: page.fan_count,
        restrictions: []
      };
    } catch (error) {
      console.error('Facebook API - Get Page Info Error:', error);
      throw new Error(`Failed to fetch page info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecentPosts(pageId: string, limit: number = 10): Promise<FacebookPost[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${pageId}/posts`, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,message,story,created_time,likes.summary(true),comments.summary(true),shares',
          limit
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Facebook API - Get Recent Posts Error:', error);
      throw new Error(`Failed to fetch recent posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPageInsights(pageId: string, metrics: string[] = ['page_fans', 'page_impressions', 'page_post_engagements']): Promise<FacebookInsights> {
    try {
      const response = await axios.get(`${this.baseUrl}/${pageId}/insights`, {
        params: {
          access_token: this.pageAccessToken,
          metric: metrics.join(','),
          period: 'day',
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0]
        }
      });

      const insights: any = {};
      response.data.data.forEach((metric: any) => {
        if (metric.values && metric.values.length > 0) {
          insights[metric.name] = metric.values[metric.values.length - 1].value;
        }
      });

      return {
        page_fans: insights.page_fans || 0,
        page_impressions: insights.page_impressions || 0,
        page_post_engagements: insights.page_post_engagements || 0,
        page_views: insights.page_views || 0
      };
    } catch (error) {
      console.error('Facebook API - Get Page Insights Error:', error);
      throw new Error(`Failed to fetch page insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async publishPost(pageId: string, message: string, options: {
    link?: string;
    picture?: string;
    scheduled_publish_time?: number;
    published?: boolean;
  } = {}): Promise<{ id: string; post_id: string }> {
    try {
      const postData: any = {
        message,
        access_token: this.pageAccessToken
      };

      if (options.link) {
        postData.link = options.link;
      }

      if (options.picture) {
        postData.picture = options.picture;
      }

      if (options.scheduled_publish_time) {
        postData.scheduled_publish_time = options.scheduled_publish_time;
        postData.published = false;
      } else {
        postData.published = options.published !== false;
      }

      const response = await axios.post(`${this.baseUrl}/${pageId}/feed`, postData);

      return {
        id: response.data.id,
        post_id: response.data.post_id || response.data.id
      };
    } catch (error) {
      console.error('Facebook API - Publish Post Error:', error);
      throw new Error(`Failed to publish post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendMessage(pageId: string, recipientId: string, message: string): Promise<{ message_id: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/${pageId}/messages`, {
        recipient: { id: recipientId },
        message: { text: message },
        access_token: this.pageAccessToken
      });

      return {
        message_id: response.data.message_id
      };
    } catch (error) {
      console.error('Facebook API - Send Message Error:', error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getConversations(pageId: string, limit: number = 25): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${pageId}/conversations`, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,snippet,updated_time,message_count,unread_count,participants',
          limit
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Facebook API - Get Conversations Error:', error);
      throw new Error(`Failed to fetch conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMessages(conversationId: string, limit: number = 25): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${conversationId}/messages`, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,created_time,from,to,message,attachments',
          limit
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Facebook API - Get Messages Error:', error);
      throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserProfile(userId: string): Promise<{
    id: string;
    name: string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/${userId}`, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,name,first_name,last_name,profile_pic'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Facebook API - Get User Profile Error:', error);
      throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    const verifyToken = process.env.FB_VERIFY_TOKEN || 'sacura_ai_webhook_token_2025';
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    
    return null;
  }

  async validatePageToken(pageId?: string): Promise<boolean> {
    try {
      const endpoint = pageId ? `${this.baseUrl}/${pageId}` : `${this.baseUrl}/me`;
      
      await axios.get(endpoint, {
        params: {
          access_token: this.pageAccessToken,
          fields: 'id,name'
        }
      });

      return true;
    } catch (error) {
      console.error('Facebook API - Token Validation Error:', error);
      return false;
    }
  }
}

export const facebookAPI = new FacebookAPIService(process.env.FB_PAGE_ACCESS_TOKEN || '');