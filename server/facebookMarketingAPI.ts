/**
 * Facebook Marketing API Integration Service
 * Leverages Marketing API for advanced campaign management, audience insights, and optimization
 */

import { APP_USER_CONFIG } from './appUserConfig';
import { facebookAppAuth } from './facebookAppAuth';

export interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  spend_cap?: string;
  daily_spend_limit?: string;
  balance?: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
  updated_time: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  reach?: string;
}

export interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  bid_amount?: string;
  targeting?: any;
  optimization_goal?: string;
}

export interface AdCreative {
  id: string;
  name: string;
  title?: string;
  body?: string;
  image_url?: string;
  video_id?: string;
  call_to_action_type?: string;
  link_url?: string;
}

export interface AdInsights {
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  frequency: string;
  ctr: string;
  cpc: string;
  cpm: string;
  cpp: string;
  actions?: any[];
  conversions?: any[];
  cost_per_action_type?: any[];
}

export interface AudienceInsight {
  name: string;
  path: string[];
  audience_size_lower_bound: number;
  audience_size_upper_bound: number;
  type: string;
  topic?: string;
}

export class FacebookMarketingAPIService {
  private marketingToken: string;
  private appId: string;
  private appSecret: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.marketingToken = APP_USER_CONFIG.marketingApiToken;
    this.appId = APP_USER_CONFIG.appId;
    this.appSecret = APP_USER_CONFIG.appSecret;
  }

  /**
   * Make authenticated Marketing API request with App Secret Proof
   */
  private async makeMarketingAPIRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    try {
      const appSecretProof = facebookAppAuth.generateAppSecretProof(this.marketingToken);
      
      const url = new URL(`${this.baseUrl}${endpoint}`);
      url.searchParams.append('access_token', this.marketingToken);
      url.searchParams.append('appsecret_proof', appSecretProof);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const options: RequestInit = {
        method,
        headers,
      };
      
      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url.toString(), options);
      const result = await response.json();
      
      if (result.error) {
        console.error('Marketing API error:', result.error);
        throw new Error(`Marketing API Error: ${result.error.message}`);
      }
      
      return result;
    } catch (error) {
      console.error('Marketing API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all ad accounts accessible with Marketing API token
   */
  async getAdAccounts(): Promise<AdAccount[]> {
    try {
      const response = await this.makeMarketingAPIRequest('/me/adaccounts', 'GET');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch ad accounts:', error);
      return [];
    }
  }

  /**
   * Get campaigns for a specific ad account
   */
  async getCampaigns(adAccountId: string, fields?: string[]): Promise<Campaign[]> {
    try {
      const fieldsParam = fields ? fields.join(',') : 'id,name,objective,status,created_time,updated_time';
      const endpoint = `/${adAccountId}/campaigns?fields=${fieldsParam}`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return [];
    }
  }

  /**
   * Get ad sets for a campaign
   */
  async getAdSets(campaignId: string, fields?: string[]): Promise<AdSet[]> {
    try {
      const fieldsParam = fields ? fields.join(',') : 'id,name,campaign_id,status,daily_budget,lifetime_budget,optimization_goal';
      const endpoint = `/${campaignId}/adsets?fields=${fieldsParam}`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch ad sets:', error);
      return [];
    }
  }

  /**
   * Get ads for an ad set
   */
  async getAds(adSetId: string, fields?: string[]): Promise<any[]> {
    try {
      const fieldsParam = fields ? fields.join(',') : 'id,name,status,creative,effective_status,campaign_id,adset_id';
      const endpoint = `/${adSetId}/ads?fields=${fieldsParam}`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      return [];
    }
  }

  /**
   * Get ad insights with performance metrics
   */
  async getAdInsights(adId: string, dateRange?: { since: string; until: string }, fields?: string[]): Promise<AdInsights[]> {
    try {
      const fieldsParam = fields ? fields.join(',') : 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,cpp,actions,conversions';
      let endpoint = `/${adId}/insights?fields=${fieldsParam}`;
      
      if (dateRange) {
        endpoint += `&time_range={'since':'${dateRange.since}','until':'${dateRange.until}'}`;
      }
      
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch ad insights:', error);
      return [];
    }
  }

  /**
   * Get campaign insights with performance metrics
   */
  async getCampaignInsights(campaignId: string, dateRange?: { since: string; until: string }): Promise<AdInsights[]> {
    try {
      const fields = 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,cpp,actions,conversions,cost_per_action_type';
      let endpoint = `/${campaignId}/insights?fields=${fields}`;
      
      if (dateRange) {
        endpoint += `&time_range={'since':'${dateRange.since}','until':'${dateRange.until}'}`;
      }
      
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch campaign insights:', error);
      return [];
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(adAccountId: string, campaignData: {
    name: string;
    objective: string;
    status?: string;
    special_ad_categories?: string[];
  }): Promise<{ id: string }> {
    try {
      const endpoint = `/${adAccountId}/campaigns`;
      const data = {
        name: campaignData.name,
        objective: campaignData.objective,
        status: campaignData.status || 'PAUSED',
        special_ad_categories: campaignData.special_ad_categories || [],
      };
      
      const response = await this.makeMarketingAPIRequest(endpoint, 'POST', data);
      return response;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED' | 'DELETED'): Promise<boolean> {
    try {
      const endpoint = `/${campaignId}`;
      const data = { status };
      
      await this.makeMarketingAPIRequest(endpoint, 'POST', data);
      return true;
    } catch (error) {
      console.error('Failed to update campaign status:', error);
      return false;
    }
  }

  /**
   * Get audience insights for targeting optimization
   */
  async getAudienceInsights(adAccountId: string, targetingSpec: any): Promise<AudienceInsight[]> {
    try {
      const endpoint = `/${adAccountId}/delivery_estimate`;
      const data = {
        targeting_spec: targetingSpec,
        optimization_goal: 'REACH',
      };
      
      const response = await this.makeMarketingAPIRequest(endpoint, 'POST', data);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch audience insights:', error);
      return [];
    }
  }

  /**
   * Get interest suggestions for audience targeting
   */
  async getInterestSuggestions(query: string, limit: number = 25): Promise<any[]> {
    try {
      const endpoint = `/search?type=adinterest&q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch interest suggestions:', error);
      return [];
    }
  }

  /**
   * Get saved audiences
   */
  async getSavedAudiences(adAccountId: string): Promise<any[]> {
    try {
      const endpoint = `/${adAccountId}/saved_audiences?fields=id,name,description,audience_size_lower_bound,audience_size_upper_bound`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch saved audiences:', error);
      return [];
    }
  }

  /**
   * Create a saved audience
   */
  async createSavedAudience(adAccountId: string, audienceData: {
    name: string;
    description?: string;
    targeting: any;
  }): Promise<{ id: string }> {
    try {
      const endpoint = `/${adAccountId}/saved_audiences`;
      const data = {
        name: audienceData.name,
        description: audienceData.description || '',
        targeting: audienceData.targeting,
      };
      
      const response = await this.makeMarketingAPIRequest(endpoint, 'POST', data);
      return response;
    } catch (error) {
      console.error('Failed to create saved audience:', error);
      throw error;
    }
  }

  /**
   * Get bid suggestions for ad sets
   */
  async getBidSuggestions(adAccountId: string, targetingSpec: any, optimizationGoal: string): Promise<any> {
    try {
      const endpoint = `/${adAccountId}/delivery_estimate`;
      const data = {
        targeting_spec: targetingSpec,
        optimization_goal: optimizationGoal,
      };
      
      const response = await this.makeMarketingAPIRequest(endpoint, 'POST', data);
      return response;
    } catch (error) {
      console.error('Failed to fetch bid suggestions:', error);
      return null;
    }
  }

  /**
   * Get account spending information
   */
  async getAccountSpending(adAccountId: string): Promise<any> {
    try {
      const fields = 'account_id,balance,currency,spend_cap,amount_spent,daily_spend_limit';
      const endpoint = `/${adAccountId}?fields=${fields}`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to fetch account spending:', error);
      return null;
    }
  }

  /**
   * Get conversion tracking pixels
   */
  async getPixels(adAccountId: string): Promise<any[]> {
    try {
      const endpoint = `/${adAccountId}/adspixels?fields=id,name,creation_time,last_fired_time`;
      const response = await this.makeMarketingAPIRequest(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch pixels:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive campaign performance report
   */
  async generateCampaignReport(adAccountId: string, dateRange?: { since: string; until: string }): Promise<{
    account: AdAccount | null;
    campaigns: Campaign[];
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;
    avgCPC: number;
    avgCPM: number;
  }> {
    try {
      // Get account info
      const accounts = await this.getAdAccounts();
      const account = accounts.find(acc => acc.id === adAccountId) || null;
      
      // Get campaigns with insights
      const campaigns = await this.getCampaigns(adAccountId);
      
      let totalSpend = 0;
      let totalImpressions = 0;
      let totalClicks = 0;
      
      // Aggregate performance metrics
      for (const campaign of campaigns) {
        const insights = await this.getCampaignInsights(campaign.id, dateRange);
        if (insights.length > 0) {
          const insight = insights[0];
          totalSpend += parseFloat(insight.spend || '0');
          totalImpressions += parseInt(insight.impressions || '0');
          totalClicks += parseInt(insight.clicks || '0');
        }
      }
      
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const avgCPM = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
      
      return {
        account,
        campaigns,
        totalSpend,
        totalImpressions,
        totalClicks,
        avgCTR,
        avgCPC,
        avgCPM,
      };
    } catch (error) {
      console.error('Failed to generate campaign report:', error);
      throw error;
    }
  }

  /**
   * Get Marketing API token validation
   */
  async validateMarketingAPIToken(): Promise<{
    isValid: boolean;
    scopes: string[];
    appId: string;
    userId?: string;
    expiresAt?: number;
  }> {
    try {
      // First test basic user info endpoint
      const endpoint = '/me?fields=id,name';
      const response = await this.makeMarketingAPIRequest(endpoint);
      
      // Get token info using app access token for debug_token
      const appAccessToken = `${this.appId}|${this.appSecret}`;
      const appSecretProof = facebookAppAuth.generateAppSecretProof(appAccessToken);
      
      const debugUrl = `${this.baseUrl}/debug_token?input_token=${this.marketingToken}&access_token=${appAccessToken}&appsecret_proof=${appSecretProof}`;
      const debugResponse = await fetch(debugUrl);
      const tokenInfo = await debugResponse.json();
      
      if (tokenInfo.error) {
        throw new Error(`Token debug failed: ${tokenInfo.error.message}`);
      }
      
      return {
        isValid: true,
        scopes: tokenInfo.data?.scopes || [],
        appId: tokenInfo.data?.app_id || '',
        userId: response.id,
        expiresAt: tokenInfo.data?.expires_at,
      };
    } catch (error) {
      console.error('Marketing API token validation failed:', error);
      return {
        isValid: false,
        scopes: [],
        appId: '',
      };
    }
  }
}

export const facebookMarketingAPI = new FacebookMarketingAPIService();