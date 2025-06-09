import axios from 'axios';

const FB_API_VERSION = 'v19.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface FacebookPageInfo {
  id: string;
  name: string;
  category: string;
  follower_count?: number;
  access_token: string;
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

export interface FacebookAdMetrics {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  conversions?: string;
  cpm: string;
  cpc: string;
  ctr: string;
  date_start: string;
  date_stop: string;
}

export class FacebookAPIService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Get User's Facebook Pages
  async getUserPages(): Promise<FacebookPageInfo[]> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/me/accounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,category,follower_count,access_token'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
      throw new Error('Failed to fetch Facebook pages');
    }
  }

  // Get User's Ad Accounts
  async getUserAdAccounts(): Promise<FacebookAdAccount[]> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/me/adaccounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,account_id,account_status,currency'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw new Error('Failed to fetch ad accounts');
    }
  }

  // Get Ad Account Insights
  async getAdAccountInsights(
    adAccountId: string,
    dateRange: { since: string; until: string }
  ): Promise<FacebookAdMetrics[]> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${adAccountId}/insights`, {
        params: {
          access_token: this.accessToken,
          fields: 'campaign_id,campaign_name,spend,impressions,clicks,conversions,cpm,cpc,ctr',
          time_range: JSON.stringify(dateRange),
          level: 'campaign',
          breakdowns: 'day'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching ad insights:', error);
      throw new Error('Failed to fetch ad insights');
    }
  }

  // Get Page Posts
  async getPagePosts(pageId: string, pageAccessToken: string, limit: number = 25) {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/posts`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching page posts:', error);
      throw new Error('Failed to fetch page posts');
    }
  }

  // Get Page Conversations (for customer service)
  async getPageConversations(pageId: string, pageAccessToken: string) {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/conversations`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,snippet,updated_time,message_count,unread_count,participants'
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  // Send Message (for automated responses)
  async sendMessage(pageId: string, pageAccessToken: string, recipientId: string, message: string) {
    try {
      const response = await axios.post(`${FB_BASE_URL}/${pageId}/messages`, {
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: 'RESPONSE'
      }, {
        params: {
          access_token: pageAccessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  // Get Page Insights
  async getPageInsights(pageId: string, pageAccessToken: string, metrics: string[], period: string = 'day') {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/insights`, {
        params: {
          access_token: pageAccessToken,
          metric: metrics.join(','),
          period
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching page insights:', error);
      throw new Error('Failed to fetch page insights');
    }
  }

  // Check Ad Account Status
  async checkAdAccountStatus(adAccountId: string): Promise<{
    status: number;
    disableReason?: string;
    restrictions?: any[];
  }> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${adAccountId}`, {
        params: {
          access_token: this.accessToken,
          fields: 'account_status,disable_reason,adaccount_restrictions'
        }
      });

      return {
        status: response.data.account_status,
        disableReason: response.data.disable_reason,
        restrictions: response.data.adaccount_restrictions?.data || []
      };
    } catch (error) {
      console.error('Error checking ad account status:', error);
      throw new Error('Failed to check ad account status');
    }
  }

  // Get Active Campaigns
  async getActiveCampaigns(adAccountId: string) {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${adAccountId}/campaigns`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,status,objective,created_time,updated_time',
          effective_status: JSON.stringify(['ACTIVE', 'PAUSED'])
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }
  }

  // Create Webhook Subscription
  async createWebhookSubscription(pageId: string, pageAccessToken: string, callbackUrl: string) {
    try {
      const response = await axios.post(`${FB_BASE_URL}/${pageId}/subscribed_apps`, {
        subscribed_fields: 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads'
      }, {
        params: {
          access_token: pageAccessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating webhook subscription:', error);
      throw new Error('Failed to create webhook subscription');
    }
  }
}

// OAuth Helper Functions
export function getFacebookOAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    response_type: 'code',
    state: Math.random().toString(36).substring(7) // Simple state for CSRF protection
  });

  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string
): Promise<{ access_token: string; token_type: string; expires_in?: number }> {
  try {
    const response = await axios.get(`${FB_BASE_URL}/oauth/access_token`, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for access token');
  }
}

export async function getLongLivedToken(
  clientId: string,
  clientSecret: string,
  shortLivedToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  try {
    const response = await axios.get(`${FB_BASE_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting long-lived token:', error);
    throw new Error('Failed to get long-lived access token');
  }
}
