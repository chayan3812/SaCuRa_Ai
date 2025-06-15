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
    // Skip API calls for demo/invalid tokens
    if (this.accessToken === 'demo_token_123' || !this.accessToken || this.accessToken.length < 10) {
      console.log('Skipping Facebook API call - demo/invalid token detected');
      return [];
    }

    try {
      const response = await axios.get(`${FB_BASE_URL}/me/accounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,category,follower_count,access_token'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching Facebook pages:', error);
      throw new Error('Failed to fetch Facebook pages - check access token validity');
    }
  }

  // Get User's Ad Accounts
  async getUserAdAccounts(): Promise<FacebookAdAccount[]> {
    // Skip API calls for demo/invalid tokens
    if (this.accessToken === 'demo_token_123' || !this.accessToken || this.accessToken.length < 10) {
      console.log('Skipping Facebook Ad Accounts API call - demo/invalid token detected');
      return [];
    }

    try {
      const response = await axios.get(`${FB_BASE_URL}/me/adaccounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,account_id,account_status,currency'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw new Error('Failed to fetch ad accounts - check access token validity');
    }
  }

  // Get Ad Account Insights
  async getAdAccountInsights(
    adAccountId: string,
    dateRange: { since: string; until: string }
  ): Promise<FacebookAdMetrics[]> {
    // Skip API calls for demo/invalid tokens
    if (this.accessToken === 'demo_token_123' || !this.accessToken || this.accessToken.length < 10) {
      console.log('Skipping Facebook Ad Insights API call - demo/invalid token detected');
      return [];
    }

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

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ad insights:', error);
      throw new Error('Failed to fetch ad insights - check access token validity');
    }
  }

  // Get Page Posts
  async getPagePosts(pageId: string, pageAccessToken: string, limit: number = 25) {
    // Skip API calls for demo/invalid tokens or page IDs
    if (pageAccessToken === 'demo_token_123' || pageId === 'demo_page_123' || !pageAccessToken || pageAccessToken.length < 10) {
      console.log('Skipping Facebook Page Posts API call - demo/invalid token detected');
      return [];
    }

    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/posts`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
          limit
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching page posts:', error);
      throw new Error('Failed to fetch page posts - check access token validity');
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
  async getPageInsights(pageId: string, pageAccessToken: string, metrics: string, period: string = 'day') {
    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/insights`, {
        params: {
          access_token: pageAccessToken,
          metric: metrics,
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

  // 👁️ Enhanced by AI on 2025-06-15 — Feature: SaveAndTrackCompetitor
  // Get Top Performing Posts from a Page
  async getTopPosts(pageId: string, limit: number = 10): Promise<any[]> {
    // Skip API calls for demo/invalid tokens
    if (this.accessToken === 'demo_token_123' || !this.accessToken || this.accessToken.length < 10) {
      console.log('Skipping Facebook API call - demo/invalid token detected');
      return [];
    }

    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/posts`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,message,story,created_time,updated_time,likes.summary(true),comments.summary(true),shares,reactions.summary(true),full_picture,permalink_url,type',
          limit: limit * 2, // Get more posts to filter for top performing ones
        }
      });

      // Sort posts by engagement (likes + comments + shares + reactions)
      const postsWithEngagement = response.data.data.map((post: any) => {
        const likes = post.likes?.summary?.total_count || 0;
        const comments = post.comments?.summary?.total_count || 0;
        const shares = post.shares?.count || 0;
        const reactions = post.reactions?.summary?.total_count || 0;
        
        return {
          ...post,
          engagement_score: likes + comments + shares + reactions,
          likes_count: likes,
          comments_count: comments,
          shares_count: shares,
          reactions_count: reactions
        };
      });

      // Sort by engagement score and return top posts
      return postsWithEngagement
        .sort((a: any, b: any) => b.engagement_score - a.engagement_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top posts:', error);
      throw new Error('Failed to fetch top posts');
    }
  }

  // Get Page Insights for Competitor Analysis
  async getPageInsights(pageId: string, metrics: string[] = ['page_fans', 'page_engaged_users', 'page_impressions']): Promise<any> {
    // Skip API calls for demo/invalid tokens
    if (this.accessToken === 'demo_token_123' || !this.accessToken || this.accessToken.length < 10) {
      console.log('Skipping Facebook API call - demo/invalid token detected');
      return {};
    }

    try {
      const response = await axios.get(`${FB_BASE_URL}/${pageId}/insights`, {
        params: {
          access_token: this.accessToken,
          metric: metrics.join(','),
          period: 'day',
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
          until: new Date().toISOString().split('T')[0]
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching page insights:', error);
      // Return empty object instead of throwing for graceful degradation
      return {};
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

  // 👁️ Enhanced by AI on 2025-06-15 — Feature: ContentScheduler
  /**
   * Publish a post to a Facebook page
   */
  async publishToPage(pageId: string, message: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          message,
          access_token: accessToken
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error publishing post:', error.response?.data || error.message);
      throw new Error(`Failed to publish post: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 👁️ Enhanced by AI on 2025-06-15 — Feature: CompetitorAnalysis
  /**
   * Get public posts from a Facebook page for competitor analysis
   * Uses public data only - no private information accessed
   */
  async getPublicPosts(pageId: string): Promise<any[]> {
    try {
      // Use a public access token or app token for public data only
      const publicAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      
      if (!publicAccessToken) {
        throw new Error('Facebook access token required for competitor analysis');
      }

      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${pageId}/posts`,
        {
          params: {
            access_token: publicAccessToken,
            fields: 'message,created_time,permalink_url,reactions.summary(true),comments.summary(true),shares',
            limit: 10 // Get last 10 posts
          }
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching public posts:', error.response?.data || error.message);
      if (error.response?.data?.error?.code === 190) {
        throw new Error('Invalid access token for Facebook API');
      }
      if (error.response?.data?.error?.code === 100) {
        throw new Error('Page not found or not publicly accessible');
      }
      throw new Error(`Failed to fetch public posts: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 👁️ Enhanced by AI on 2025-06-15 — Feature: RestrictionMonitor
  /**
   * Get comprehensive page information for health monitoring
   */
  async getPageInfo(pageId: string, accessToken: string): Promise<{
    id: string;
    name: string;
    about?: string;
    can_post: boolean;
    posts?: any[];
    category?: string;
    restrictions?: any[];
  }> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${pageId}`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,about,can_post,category,posts.limit(5){id,message,created_time,story}'
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching page info:', error.response?.data || error.message);
      throw new Error(`Failed to fetch page info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Check if page has posting restrictions
   */
  async checkPageRestrictions(pageId: string, accessToken: string): Promise<{
    hasRestrictions: boolean;
    restrictions: any[];
    canPost: boolean;
  }> {
    try {
      const pageInfo = await this.getPageInfo(pageId, accessToken);
      
      // Check for obvious restrictions
      const hasRestrictions = !pageInfo.can_post;
      const restrictions = [];
      
      if (!pageInfo.can_post) {
        restrictions.push({
          type: 'posting_disabled',
          severity: 'critical',
          message: 'Page posting is currently disabled'
        });
      }
      
      return {
        hasRestrictions,
        restrictions,
        canPost: pageInfo.can_post
      };
    } catch (error: any) {
      return {
        hasRestrictions: true,
        restrictions: [{
          type: 'api_error',
          severity: 'high',
          message: error.message
        }],
        canPost: false
      };
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
