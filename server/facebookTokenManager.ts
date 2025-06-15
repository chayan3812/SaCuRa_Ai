import axios from 'axios';

const FB_API_VERSION = 'v19.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface TokenValidationResult {
  isValid: boolean;
  tokenType: 'user' | 'page' | 'app' | 'unknown';
  permissions: string[];
  appId?: string;
  userId?: string;
  pageId?: string;
  expiresAt?: number;
  scopes?: string[];
  errorMessage?: string;
}

export interface FacebookCredentials {
  userAccessToken?: string;
  pageAccessToken?: string;
  appAccessToken?: string;
  appId?: string;
  appSecret?: string;
}

export class FacebookTokenManager {
  private credentials: FacebookCredentials;

  constructor(credentials: FacebookCredentials) {
    this.credentials = credentials;
  }

  // Validate any Facebook token
  async validateToken(token: string, debugToken?: string): Promise<TokenValidationResult> {
    try {
      // First, try to get basic token info
      const debugResponse = await axios.get(`${FB_BASE_URL}/debug_token`, {
        params: {
          input_token: token,
          access_token: debugToken || this.credentials.appAccessToken || token
        }
      });

      const tokenData = debugResponse.data.data;

      if (!tokenData.is_valid) {
        return {
          isValid: false,
          tokenType: 'unknown',
          permissions: [],
          errorMessage: 'Token is not valid'
        };
      }

      // Get permissions for user tokens
      let permissions: string[] = [];
      if (tokenData.type === 'USER') {
        try {
          const permissionsResponse = await axios.get(`${FB_BASE_URL}/me/permissions`, {
            params: { access_token: token }
          });
          permissions = permissionsResponse.data.data
            .filter((perm: any) => perm.status === 'granted')
            .map((perm: any) => perm.permission);
        } catch (error) {
          console.log('Could not fetch permissions, token might be page-level');
        }
      }

      return {
        isValid: true,
        tokenType: this.mapTokenType(tokenData.type),
        permissions,
        appId: tokenData.app_id,
        userId: tokenData.user_id,
        expiresAt: tokenData.expires_at,
        scopes: tokenData.scopes || []
      };

    } catch (error: any) {
      return {
        isValid: false,
        tokenType: 'unknown',
        permissions: [],
        errorMessage: error.response?.data?.error?.message || 'Token validation failed'
      };
    }
  }

  // Get user's Facebook pages with their access tokens
  async getUserPages(userToken: string): Promise<Array<{
    id: string;
    name: string;
    access_token: string;
    category: string;
    tasks: string[];
  }>> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/me/accounts`, {
        params: {
          access_token: userToken,
          fields: 'id,name,access_token,category,tasks'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user pages:', error);
      return [];
    }
  }

  // Exchange short-lived token for long-lived token
  async exchangeForLongLivedToken(shortToken: string): Promise<{
    access_token?: string;
    expires_in?: number;
    error?: string;
  }> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.credentials.appId,
          client_secret: this.credentials.appSecret,
          fb_exchange_token: shortToken
        }
      });

      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error?.message || 'Token exchange failed'
      };
    }
  }

  // Generate Facebook Login URL
  generateLoginUrl(redirectUri: string, scopes: string[] = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_metadata',
    'business_management',
    'ads_read',
    'read_insights'
  ]): string {
    const params = new URLSearchParams({
      client_id: this.credentials.appId || '',
      redirect_uri: redirectUri,
      scope: scopes.join(','),
      response_type: 'code',
      state: 'facebook_auth_' + Date.now()
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    error?: string;
  }> {
    try {
      const response = await axios.get(`${FB_BASE_URL}/oauth/access_token`, {
        params: {
          client_id: this.credentials.appId,
          client_secret: this.credentials.appSecret,
          redirect_uri: redirectUri,
          code: code
        }
      });

      return response.data;
    } catch (error: any) {
      return {
        error: error.response?.data?.error?.message || 'Code exchange failed'
      };
    }
  }

  // Test all provided credentials
  async testAllCredentials(): Promise<{
    userToken: TokenValidationResult;
    pageToken: TokenValidationResult;
    appToken: TokenValidationResult;
    recommendations: string[];
  }> {
    const results = {
      userToken: { isValid: false, tokenType: 'unknown' as const, permissions: [] },
      pageToken: { isValid: false, tokenType: 'unknown' as const, permissions: [] },
      appToken: { isValid: false, tokenType: 'unknown' as const, permissions: [] },
      recommendations: [] as string[]
    };

    // Test user access token
    if (this.credentials.userAccessToken) {
      results.userToken = await this.validateToken(this.credentials.userAccessToken);
    }

    // Test page access token
    if (this.credentials.pageAccessToken) {
      results.pageToken = await this.validateToken(this.credentials.pageAccessToken);
    }

    // Test app access token
    if (this.credentials.appAccessToken) {
      results.appToken = await this.validateToken(this.credentials.appAccessToken);
    }

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  private mapTokenType(fbType: string): 'user' | 'page' | 'app' | 'unknown' {
    switch (fbType?.toUpperCase()) {
      case 'USER': return 'user';
      case 'PAGE': return 'page';
      case 'APP': return 'app';
      default: return 'unknown';
    }
  }

  private generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    if (!results.userToken.isValid) {
      recommendations.push('User Access Token is invalid - please generate a new token from Facebook Developer Console');
    }

    if (!results.appToken.isValid) {
      recommendations.push('App Access Token is invalid - verify your App ID and App Secret');
    }

    if (results.userToken.isValid && results.userToken.permissions.length === 0) {
      recommendations.push('User token has no permissions - request necessary permissions during login');
    }

    if (results.userToken.isValid && !results.userToken.permissions.includes('pages_show_list')) {
      recommendations.push('Missing pages_show_list permission - required to access Facebook Pages');
    }

    if (results.userToken.isValid && !results.userToken.permissions.includes('ads_read')) {
      recommendations.push('Missing ads_read permission - required for ad analytics');
    }

    if (results.userToken.expiresAt && results.userToken.expiresAt < Date.now() / 1000) {
      recommendations.push('User token has expired - exchange for long-lived token or regenerate');
    }

    return recommendations;
  }
}

// Helper function to create token manager with environment variables
export function createTokenManager(): FacebookTokenManager {
  return new FacebookTokenManager({
    userAccessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
    appAccessToken: process.env.FACEBOOK_APP_TOKEN,
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET
  });
}