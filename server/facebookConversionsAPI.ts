/**
 * Facebook Conversions API Implementation
 * Advanced conversion tracking and optimization for PagePilot AI
 * Based on: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import axios from 'axios';
import crypto from 'crypto';

export interface ConversionEvent {
  event_name: string;
  event_time: number;
  action_source: 'website' | 'app' | 'phone_call' | 'chat' | 'email' | 'other';
  event_source_url?: string;
  user_data: {
    email_address?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: 'M' | 'F';
    city?: string;
    state?: string;
    zip_code?: string;
    country_code?: string;
    external_id?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    click_id?: string;
    browser_id?: string;
    subscription_id?: string;
    fb_login_id?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
    predicted_ltv?: number;
    num_items?: number;
    search_string?: string;
    status?: string;
    item_number?: string;
    delivery_category?: 'in_store' | 'curbside' | 'home_delivery';
    custom_properties?: Record<string, any>;
  };
  event_id?: string;
  opt_out?: boolean;
  partner_name?: string;
}

export interface ConversionPayload {
  data: ConversionEvent[];
  test_event_code?: string;
  partner_agent?: string;
  namespace_id?: string;
  upload_id?: string;
  upload_tag?: string;
  upload_source?: string;
}

export interface ConversionResponse {
  events_received: number;
  messages: string[];
  fbtrace_id: string;
}

export class FacebookConversionsAPI {
  private readonly accessToken: string;
  private readonly pixelId: string;
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';
  private readonly testEventCode?: string;

  constructor(accessToken: string, pixelId: string, testEventCode?: string) {
    this.accessToken = accessToken;
    this.pixelId = pixelId;
    this.testEventCode = testEventCode;
  }

  /**
   * Hash user data for privacy compliance
   */
  private hashUserData(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  /**
   * Normalize and hash user data
   */
  private normalizeUserData(userData: ConversionEvent['user_data']): ConversionEvent['user_data'] {
    const normalized: ConversionEvent['user_data'] = {};

    if (userData.email_address) {
      normalized.email_address = this.hashUserData(userData.email_address);
    }
    if (userData.phone_number) {
      // Remove non-digits and add country code if missing
      const phone = userData.phone_number.replace(/\D/g, '');
      normalized.phone_number = this.hashUserData(phone.startsWith('1') ? phone : `1${phone}`);
    }
    if (userData.first_name) {
      normalized.first_name = this.hashUserData(userData.first_name);
    }
    if (userData.last_name) {
      normalized.last_name = this.hashUserData(userData.last_name);
    }
    if (userData.city) {
      normalized.city = this.hashUserData(userData.city);
    }
    if (userData.state) {
      normalized.state = this.hashUserData(userData.state);
    }
    if (userData.zip_code) {
      normalized.zip_code = this.hashUserData(userData.zip_code);
    }
    if (userData.country_code) {
      normalized.country_code = this.hashUserData(userData.country_code);
    }
    if (userData.date_of_birth) {
      normalized.date_of_birth = this.hashUserData(userData.date_of_birth);
    }
    if (userData.gender) {
      normalized.gender = this.hashUserData(userData.gender);
    }
    if (userData.external_id) {
      normalized.external_id = this.hashUserData(userData.external_id);
    }

    // Non-hashed fields
    if (userData.client_ip_address) {
      normalized.client_ip_address = userData.client_ip_address;
    }
    if (userData.client_user_agent) {
      normalized.client_user_agent = userData.client_user_agent;
    }
    if (userData.click_id) {
      normalized.click_id = userData.click_id;
    }
    if (userData.browser_id) {
      normalized.browser_id = userData.browser_id;
    }
    if (userData.subscription_id) {
      normalized.subscription_id = userData.subscription_id;
    }
    if (userData.fb_login_id) {
      normalized.fb_login_id = userData.fb_login_id;
    }

    return normalized;
  }

  /**
   * Send conversion events to Facebook
   */
  async sendEvents(events: ConversionEvent[], options?: {
    testEventCode?: string;
    uploadTag?: string;
    uploadSource?: string;
  }): Promise<ConversionResponse> {
    try {
      // Normalize user data for privacy
      const normalizedEvents = events.map(event => ({
        ...event,
        user_data: this.normalizeUserData(event.user_data),
        event_time: Math.floor(event.event_time / 1000), // Convert to Unix timestamp
        event_id: event.event_id || crypto.randomUUID(),
      }));

      const payload: ConversionPayload = {
        data: normalizedEvents,
        partner_agent: 'PagePilotAI/1.0',
        test_event_code: options?.testEventCode || this.testEventCode,
        upload_tag: options?.uploadTag,
        upload_source: options?.uploadSource || 'PagePilotAI',
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.pixelId}/events`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Facebook Conversions API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Track page view event
   */
  async trackPageView(userData: ConversionEvent['user_data'], customData?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'PageView',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: customData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track purchase event
   */
  async trackPurchase(userData: ConversionEvent['user_data'], purchaseData: {
    value: number;
    currency: string;
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    order_id?: string;
    num_items?: number;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'Purchase',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: purchaseData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track lead generation event
   */
  async trackLead(userData: ConversionEvent['user_data'], leadData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'Lead',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: leadData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track custom event
   */
  async trackCustomEvent(
    eventName: string,
    userData: ConversionEvent['user_data'],
    customData?: ConversionEvent['custom_data'],
    actionSource: ConversionEvent['action_source'] = 'website'
  ): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: eventName,
      event_time: Date.now(),
      action_source: actionSource,
      user_data: userData,
      custom_data: customData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track add to cart event
   */
  async trackAddToCart(userData: ConversionEvent['user_data'], cartData: {
    value: number;
    currency: string;
    content_ids: string[];
    content_name?: string;
    content_category?: string;
    content_type?: string;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'AddToCart',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: cartData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track initiate checkout event
   */
  async trackInitiateCheckout(userData: ConversionEvent['user_data'], checkoutData: {
    value: number;
    currency: string;
    content_ids?: string[];
    content_category?: string;
    num_items?: number;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'InitiateCheckout',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: checkoutData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track view content event
   */
  async trackViewContent(userData: ConversionEvent['user_data'], contentData: {
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    content_type?: string;
    value?: number;
    currency?: string;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'ViewContent',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: contentData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track search event
   */
  async trackSearch(userData: ConversionEvent['user_data'], searchData: {
    search_string: string;
    content_category?: string;
    content_ids?: string[];
    value?: number;
    currency?: string;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'Search',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: searchData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track contact event
   */
  async trackContact(userData: ConversionEvent['user_data']): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'Contact',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Track complete registration event
   */
  async trackCompleteRegistration(userData: ConversionEvent['user_data'], registrationData?: {
    content_name?: string;
    value?: number;
    currency?: string;
    status?: string;
  }): Promise<ConversionResponse> {
    const event: ConversionEvent = {
      event_name: 'CompleteRegistration',
      event_time: Date.now(),
      action_source: 'website',
      user_data: userData,
      custom_data: registrationData,
    };

    return this.sendEvents([event]);
  }

  /**
   * Batch multiple events for efficient sending
   */
  async batchTrackEvents(events: ConversionEvent[]): Promise<ConversionResponse> {
    return this.sendEvents(events);
  }

  /**
   * Test event sending (useful for validation)
   */
  async testEvent(event: ConversionEvent, testEventCode: string): Promise<ConversionResponse> {
    return this.sendEvents([event], { testEventCode });
  }

  /**
   * Get test events (for debugging)
   */
  async getTestEvents(testEventCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.pixelId}/testevents`,
        {
          params: {
            test_event_code: testEventCode,
            access_token: this.accessToken,
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Facebook Test Events API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}

// Enhanced conversion tracking with AI-powered insights
export class EnhancedConversionTracker {
  private conversionsAPI: FacebookConversionsAPI;
  private conversionHistory: Map<string, ConversionEvent[]> = new Map();

  constructor(conversionsAPI: FacebookConversionsAPI) {
    this.conversionsAPI = conversionsAPI;
  }

  /**
   * Track conversion with automatic user data enrichment
   */
  async trackEnhancedConversion(
    eventName: string,
    userData: Partial<ConversionEvent['user_data']>,
    customData?: ConversionEvent['custom_data'],
    context?: {
      pageUrl?: string;
      referrer?: string;
      userAgent?: string;
      ipAddress?: string;
    }
  ): Promise<ConversionResponse> {
    // Enrich user data with context
    const enrichedUserData: ConversionEvent['user_data'] = {
      ...userData,
      client_user_agent: context?.userAgent,
      client_ip_address: context?.ipAddress,
    };

    // Enhanced custom data with context
    const enhancedCustomData = {
      ...customData,
      ...(context?.pageUrl && { content_name: context.pageUrl }),
    };

    const result = await this.conversionsAPI.trackCustomEvent(
      eventName,
      enrichedUserData,
      enhancedCustomData
    );

    // Store for analytics
    const userId = userData.external_id || userData.email_address || 'anonymous';
    if (!this.conversionHistory.has(userId)) {
      this.conversionHistory.set(userId, []);
    }
    
    this.conversionHistory.get(userId)?.push({
      event_name: eventName,
      event_time: Date.now(),
      action_source: 'website',
      user_data: enrichedUserData,
      custom_data: enhancedCustomData,
    });

    return result;
  }

  /**
   * Get conversion analytics for a user
   */
  getUserConversionHistory(userId: string): ConversionEvent[] {
    return this.conversionHistory.get(userId) || [];
  }

  /**
   * Get conversion funnel analytics
   */
  getConversionFunnel(): {
    [eventName: string]: {
      count: number;
      totalValue: number;
      avgValue: number;
      conversionRate: number;
    };
  } {
    const funnelData: any = {};
    const allEvents: ConversionEvent[] = [];
    
    for (const events of this.conversionHistory.values()) {
      allEvents.push(...events);
    }

    const totalUsers = this.conversionHistory.size;

    for (const event of allEvents) {
      const eventName = event.event_name;
      if (!funnelData[eventName]) {
        funnelData[eventName] = {
          count: 0,
          totalValue: 0,
          avgValue: 0,
          conversionRate: 0,
        };
      }

      funnelData[eventName].count++;
      if (event.custom_data?.value) {
        funnelData[eventName].totalValue += event.custom_data.value;
      }
    }

    // Calculate averages and conversion rates
    for (const eventName in funnelData) {
      const data = funnelData[eventName];
      data.avgValue = data.totalValue / data.count;
      data.conversionRate = (data.count / totalUsers) * 100;
    }

    return funnelData;
  }

  /**
   * Clear conversion history (for privacy compliance)
   */
  clearHistory(): void {
    this.conversionHistory.clear();
  }
}