/**
 * Facebook Token Manager
 * Handles Facebook OAuth flow and token management
 */

import axios from 'axios';

interface FacebookApp {
  id: string;
  secret: string;
}

interface TokenResult {
  access_token?: string;
  error?: string;
}

interface PageInfo {
  id: string;
  name: string;
  access_token: string;
  category: string;
  follower_count?: number;
}

export class FacebookTokenManager {
  private appId: string;
  private appSecret: string;
  private baseUrl = 'https://graph.facebook.com/v21.0';

  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID || '';
    this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
    
    if (!this.appId || !this.appSecret) {
      console.warn('Facebook App ID and App Secret not configured - OAuth will not work');
    }
  }

  generateLoginUrl(redirectUri: string): string {
    const scopes = [
      // Core Page Management (Standard Access)
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_user_content',
      'pages_show_list',
      
      // Messaging & Customer Service (Standard Access)
      'pages_messaging',
      'pages_messaging_subscriptions',
      
      // Business Management (Standard Access)
      'business_management',
      
      // Marketing & Ads (Advanced Access Required)
      'ads_management',
      'ads_read',
      
      // Instagram Integration (Standard Access)
      'instagram_basic',
      'instagram_manage_comments',
      'instagram_manage_insights',
      
      // Analytics & Insights (Standard Access)
      'read_insights',
      'pages_read_user_content'
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      state: Math.random().toString(36).substring(7)
    });

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      return {
        access_token: response.data.access_token
      };
    } catch (error: any) {
      console.error('Token exchange error:', error.response?.data || error.message);
      return {
        error: 'Failed to exchange code for token'
      };
    }
  }

  async validateToken(token: string): Promise<{ valid: boolean; scopes: string[]; user?: any; error?: string }> {
    try {
      // First check token validity and get user info
      const userResponse = await axios.get(`${this.baseUrl}/me`, {
        params: {
          access_token: token,
          fields: 'id,name,email'
        }
      });

      // Get granted permissions
      const permissionsResponse = await axios.get(`${this.baseUrl}/me/permissions`, {
        params: {
          access_token: token
        }
      });

      const permissions = permissionsResponse.data.data || [];
      const grantedScopes = permissions
        .filter((perm: any) => perm.status === 'granted')
        .map((perm: any) => perm.permission);

      return {
        valid: true,
        user: userResponse.data,
        scopes: grantedScopes
      };
    } catch (error: any) {
      console.error('Token validation error:', error.response?.data || error.message);
      return {
        valid: false,
        scopes: [],
        error: error.response?.data?.error?.message || 'Invalid token'
      };
    }
  }

  checkPermissions(grantedScopes: string[]): {
    pageManagement: boolean;
    messaging: boolean; 
    instagram: boolean;
    insights: boolean;
    advertising: boolean;
  } {
    return {
      pageManagement: ['pages_manage_posts', 'pages_manage_metadata'].some(p => grantedScopes.includes(p)),
      messaging: ['pages_messaging'].includes(grantedScopes[0]) || grantedScopes.includes('pages_messaging'),
      instagram: ['instagram_basic', 'instagram_manage_insights'].some(p => grantedScopes.includes(p)),
      insights: grantedScopes.includes('read_insights'),
      advertising: ['ads_management', 'ads_read'].some(p => grantedScopes.includes(p))
    };
  }

  async getUserPages(userToken: string): Promise<PageInfo[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/accounts`, {
        params: {
          access_token: userToken,
          fields: 'id,name,access_token,category,fan_count'
        }
      });

      return response.data.data.map((page: any) => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category || 'Unknown',
        follower_count: page.fan_count || 0
      }));
    } catch (error: any) {
      console.error('Get user pages error:', error.response?.data || error.message);
      throw new Error('Failed to fetch user pages');
    }
  }

  async testAllCredentials(): Promise<any> {
    const results = {
      appCredentials: { valid: false, error: '' },
      userToken: { valid: false, error: '' },
      pageToken: { valid: false, error: '' }
    };

    // Test app credentials
    try {
      const appToken = `${this.appId}|${this.appSecret}`;
      await axios.get(`${this.baseUrl}/${this.appId}`, {
        params: { access_token: appToken }
      });
      results.appCredentials.valid = true;
    } catch (error: any) {
      results.appCredentials.error = error.response?.data?.error?.message || 'Invalid app credentials';
    }

    // Test user token if available
    const userToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (userToken) {
      const validation = await this.validateToken(userToken);
      results.userToken.valid = validation.valid;
      results.userToken.error = validation.error || '';
    } else {
      results.userToken.error = 'No user token configured';
    }

    // Test page token if available
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
    if (pageToken) {
      const validation = await this.validateToken(pageToken);
      results.pageToken.valid = validation.valid;
      results.pageToken.error = validation.error || '';
    } else {
      results.pageToken.error = 'No page token configured';
    }

    return results;
  }
}

export function createTokenManager(): FacebookTokenManager {
  return new FacebookTokenManager();
}