/**
 * Enhanced Facebook App Authentication Service
 * Provides secure authentication using App ID and App Secret for reliable API access
 */

import crypto from 'crypto';
import { APP_USER_CONFIG } from './appUserConfig';

export interface FacebookAppAuth {
  appId: string;
  appSecret: string;
  accessToken: string;
  isValid: boolean;
  expiresAt?: Date;
}

export interface SecureAPIRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

export class FacebookAppAuthService {
  private appId: string;
  private appSecret: string;
  private accessToken: string;
  private conversionsToken: string;

  constructor() {
    this.appId = APP_USER_CONFIG.appId;
    this.appSecret = APP_USER_CONFIG.appSecret;
    this.accessToken = APP_USER_CONFIG.accessToken;
    this.conversionsToken = APP_USER_CONFIG.conversionsToken;
  }

  /**
   * Generate App Secret Proof for enhanced security
   * Required for high-security Facebook Graph API calls
   */
  generateAppSecretProof(accessToken: string = this.accessToken): string {
    return crypto
      .createHmac('sha256', this.appSecret)
      .update(accessToken)
      .digest('hex');
  }

  /**
   * Validate Facebook App credentials
   */
  async validateAppCredentials(): Promise<boolean> {
    try {
      const appSecretProof = this.generateAppSecretProof();
      const url = `https://graph.facebook.com/v18.0/app?access_token=${this.accessToken}&appsecret_proof=${appSecretProof}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error('Facebook App validation error:', data.error);
        return false;
      }
      
      return data.id === this.appId;
    } catch (error) {
      console.error('App credential validation failed:', error);
      return false;
    }
  }

  /**
   * Get App Access Token using App ID and App Secret
   * Provides enhanced security for server-to-server calls
   */
  async getAppAccessToken(): Promise<string | null> {
    try {
      const url = `https://graph.facebook.com/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&grant_type=client_credentials`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error('App access token error:', data.error);
        return null;
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Failed to get app access token:', error);
      return null;
    }
  }

  /**
   * Validate User Access Token against App
   */
  async validateUserAccessToken(userToken: string): Promise<boolean> {
    try {
      const appAccessToken = await this.getAppAccessToken();
      if (!appAccessToken) return false;

      const url = `https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${appAccessToken}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error || !data.data) {
        console.error('Token validation error:', data.error);
        return false;
      }
      
      return data.data.app_id === this.appId && data.data.is_valid;
    } catch (error) {
      console.error('User token validation failed:', error);
      return false;
    }
  }

  /**
   * Make secure Facebook Graph API request with App Secret Proof
   */
  async makeSecureAPIRequest(request: SecureAPIRequest): Promise<any> {
    try {
      const appSecretProof = this.generateAppSecretProof();
      
      const url = new URL(request.url);
      url.searchParams.append('access_token', this.accessToken);
      url.searchParams.append('appsecret_proof', appSecretProof);
      
      const headers = {
        'Content-Type': 'application/json',
        ...request.headers,
      };
      
      const options: RequestInit = {
        method: request.method,
        headers,
      };
      
      if (request.data && request.method !== 'GET') {
        options.body = JSON.stringify(request.data);
      }
      
      const response = await fetch(url.toString(), options);
      const data = await response.json();
      
      if (data.error) {
        console.error('Secure API request error:', data.error);
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Secure API request failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced Conversions API request with App Secret authentication
   */
  async makeConversionsAPIRequest(pixelId: string, eventData: any): Promise<any> {
    try {
      const url = `https://graph.facebook.com/v18.0/${pixelId}/events`;
      const appSecretProof = this.generateAppSecretProof(this.conversionsToken);
      
      const requestData = {
        ...eventData,
        partner_agent: 'PagePilot AI',
        namespace_id: this.appId,
        upload_id: `pagepilot_${Date.now()}`,
        upload_tag: 'pagepilot_ai',
        upload_source: 'website',
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.conversionsToken}`,
        },
        body: JSON.stringify({
          data: [requestData],
          test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined,
          access_token: this.conversionsToken,
          appsecret_proof: appSecretProof,
        }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Conversions API error:', result.error);
        throw new Error(`Conversions API Error: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Conversions API request failed:', error);
      throw error;
    }
  }

  /**
   * Verify App Secret and generate secure configuration
   */
  getSecureConfig(): FacebookAppAuth {
    const isValid = this.appId && this.appSecret && this.accessToken;
    
    return {
      appId: this.appId,
      appSecret: this.appSecret.substring(0, 8) + '...', // Partially masked for logging
      accessToken: this.accessToken.substring(0, 20) + '...', // Partially masked for logging
      isValid: Boolean(isValid),
    };
  }

  /**
   * Get authentication headers for secure Facebook API calls
   */
  getAuthHeaders(includeProof: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    };
    
    if (includeProof) {
      headers['X-App-Secret-Proof'] = this.generateAppSecretProof();
    }
    
    return headers;
  }

  /**
   * Enhanced security validation for all Facebook API interactions
   */
  async performSecurityValidation(): Promise<{
    appValid: boolean;
    tokenValid: boolean;
    secretProofValid: boolean;
    recommendedActions: string[];
  }> {
    const results = {
      appValid: false,
      tokenValid: false,
      secretProofValid: false,
      recommendedActions: [] as string[],
    };
    
    try {
      // Validate app credentials
      results.appValid = await this.validateAppCredentials();
      if (!results.appValid) {
        results.recommendedActions.push('Verify App ID and App Secret are correct');
      }
      
      // Validate access token
      results.tokenValid = await this.validateUserAccessToken(this.accessToken);
      if (!results.tokenValid) {
        results.recommendedActions.push('Refresh or regenerate Access Token');
      }
      
      // Validate secret proof generation
      try {
        const proof = this.generateAppSecretProof();
        results.secretProofValid = proof.length === 64; // SHA-256 hex length
        if (!results.secretProofValid) {
          results.recommendedActions.push('Verify App Secret is correctly configured');
        }
      } catch (error) {
        results.secretProofValid = false;
        results.recommendedActions.push('Fix App Secret configuration');
      }
      
    } catch (error) {
      console.error('Security validation failed:', error);
      results.recommendedActions.push('Check network connectivity to Facebook Graph API');
    }
    
    return results;
  }
}

export const facebookAppAuth = new FacebookAppAuthService();