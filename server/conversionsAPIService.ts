/**
 * Facebook Conversions API Service
 * Production-ready service for server-side conversion tracking
 */
import axios from 'axios';
import { APP_USER_CONFIG } from './appUserConfig';

export interface ConversionEvent {
  event_name: string;
  event_time: number;
  action_source: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  user_data: {
    external_id?: string;
    email?: string;
    phone?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
    fb_login_id?: string;
  };
  custom_data?: {
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
      delivery_category?: string;
    }>;
    currency?: string;
    value?: number;
    order_id?: string;
    predicted_ltv?: number;
    num_items?: number;
    search_string?: string;
    status?: string;
  };
  event_source_url?: string;
  opt_out?: boolean;
}

export interface BatchConversionPayload {
  data: ConversionEvent[];
  partner_agent?: string;
  test_event_code?: string;
}

export class ConversionsAPIService {
  private accessToken: string;
  private pixelId: string;
  private baseUrl: string;
  private appUserId: string;

  constructor() {
    this.accessToken = process.env.FB_PIXEL_ACCESS_TOKEN || APP_USER_CONFIG.conversionsToken;
    this.pixelId = APP_USER_CONFIG.pixelId;
    this.appUserId = APP_USER_CONFIG.appUserId;
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.pixelId}/events`;
  }

  /**
   * Hash user data for privacy compliance
   */
  private hashUserData(userData: any): any {
    const crypto = require('crypto');
    const hashedData = { ...userData };

    if (hashedData.email) {
      hashedData.email = crypto.createHash('sha256').update(hashedData.email.toLowerCase().trim()).digest('hex');
    }
    if (hashedData.phone) {
      hashedData.phone = crypto.createHash('sha256').update(hashedData.phone.replace(/\D/g, '')).digest('hex');
    }
    if (hashedData.external_id) {
      hashedData.external_id = crypto.createHash('sha256').update(hashedData.external_id.toString()).digest('hex');
    }

    return hashedData;
  }

  /**
   * Send single conversion event
   */
  async trackEvent(event: ConversionEvent): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      // Add App User ID for proper attribution
      event.user_data.fb_login_id = this.appUserId;
      
      // Hash sensitive user data
      event.user_data = this.hashUserData(event.user_data);

      const payload: BatchConversionPayload = {
        data: [event],
        partner_agent: 'SaCuRa AI Platform',
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          access_token: this.accessToken,
        },
      });

      return {
        success: true,
        response: response.data,
      };
    } catch (error: any) {
      console.error('Conversions API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send batch conversion events
   */
  async batchTrackEvents(events: ConversionEvent[]): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      // Add App User ID and hash data for all events
      const processedEvents = events.map(event => ({
        ...event,
        user_data: this.hashUserData({
          ...event.user_data,
          fb_login_id: this.appUserId,
        }),
      }));

      const payload: BatchConversionPayload = {
        data: processedEvents,
        partner_agent: 'SaCuRa AI Platform',
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          access_token: this.accessToken,
        },
      });

      return {
        success: true,
        response: response.data,
      };
    } catch (error: any) {
      console.error('Batch Conversions API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Track page view conversion
   */
  async trackPageView(userData: any, customData?: any): Promise<{ success: boolean; response?: any; error?: string }> {
    const event: ConversionEvent = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: customData,
      event_source_url: customData?.source_url,
    };

    return this.trackEvent(event);
  }

  /**
   * Track purchase conversion
   */
  async trackPurchase(userData: any, purchaseData: {
    value: number;
    currency: string;
    order_id?: string;
    content_ids?: string[];
    contents?: Array<{ id: string; quantity: number }>;
    num_items?: number;
  }): Promise<{ success: boolean; response?: any; error?: string }> {
    const event: ConversionEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: purchaseData,
    };

    return this.trackEvent(event);
  }

  /**
   * Track lead conversion
   */
  async trackLead(userData: any, leadData?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  }): Promise<{ success: boolean; response?: any; error?: string }> {
    const event: ConversionEvent = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: leadData,
    };

    return this.trackEvent(event);
  }

  /**
   * Track custom event
   */
  async trackCustomEvent(
    eventName: string,
    userData: any,
    customData?: any,
    actionSource: ConversionEvent['action_source'] = 'website'
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    const event: ConversionEvent = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: actionSource,
      user_data: userData,
      custom_data: customData,
    };

    return this.trackEvent(event);
  }

  /**
   * Get conversion metrics
   */
  async getConversionMetrics(dateRange?: { since: string; until: string }): Promise<any> {
    try {
      const insightsUrl = `https://graph.facebook.com/v18.0/${this.pixelId}/insights`;
      
      const params: any = {
        access_token: this.accessToken,
        fields: 'event_name,count,total_value,cost_per_conversion',
      };

      if (dateRange) {
        params.since = dateRange.since;
        params.until = dateRange.until;
      }

      const response = await axios.get(insightsUrl, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching conversion metrics:', error.response?.data || error.message);
      throw new Error('Failed to fetch conversion metrics');
    }
  }

  /**
   * Test API connectivity and configuration
   */
  async testSetup(): Promise<{ isValid: boolean; testResults: any[]; error?: string }> {
    const testResults = [];
    
    try {
      // Test 1: Verify access token
      const tokenTestUrl = `https://graph.facebook.com/v18.0/me`;
      try {
        const tokenResponse = await axios.get(tokenTestUrl, {
          params: { access_token: this.accessToken }
        });
        testResults.push({
          test: 'Access Token Validation',
          status: 'passed',
          details: `Token valid for: ${tokenResponse.data.name || 'Facebook User'}`
        });
      } catch (tokenError: any) {
        testResults.push({
          test: 'Access Token Validation',
          status: 'failed',
          details: tokenError.response?.data?.error?.message || 'Invalid access token'
        });
        return { isValid: false, testResults };
      }

      // Test 2: Send test event
      const testEvent: ConversionEvent = {
        event_name: 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          external_id: 'test_user_' + Date.now(),
          client_ip_address: '127.0.0.1',
          client_user_agent: 'SaCuRa AI Test Agent',
        },
        custom_data: {
          content_name: 'API Test',
          content_category: 'Testing',
        },
      };

      const eventResult = await this.trackEvent(testEvent);
      testResults.push({
        test: 'Test Event Tracking',
        status: eventResult.success ? 'passed' : 'failed',
        details: eventResult.success ? 'Test event sent successfully' : eventResult.error
      });

      const allTestsPassed = testResults.every(result => result.status === 'passed');
      
      return {
        isValid: allTestsPassed,
        testResults
      };

    } catch (error: any) {
      return {
        isValid: false,
        testResults,
        error: error.message
      };
    }
  }
}

export const conversionsAPI = new ConversionsAPIService();