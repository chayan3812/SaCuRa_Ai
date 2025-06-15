/**
 * Facebook Ads API Service
 * Advanced advertising management with Facebook Marketing API
 */

import axios from 'axios';

const FB_API_VERSION = 'v21.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  spend_cap?: string;
  balance?: string;
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
  updated_time: string;
  start_time?: string;
  stop_time?: string;
  budget_remaining?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  spend_cap?: string;
}

interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  end_time?: string;
  targeting?: any;
  optimization_goal: string;
  billing_event: string;
  bid_strategy?: string;
}

interface Ad {
  id: string;
  name: string;
  adset_id: string;
  campaign_id: string;
  status: string;
  creative: {
    id: string;
    title?: string;
    body?: string;
    image_url?: string;
    video_id?: string;
  };
  configured_status: string;
  effective_status: string;
}

interface AdInsights {
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  frequency: string;
  ctr: string;
  cpc: string;
  cpm: string;
  cpp: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  date_start: string;
  date_stop: string;
}

interface CreateCampaignData {
  name: string;
  objective: string;
  status?: string;
  special_ad_categories?: string[];
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

interface CreateAdSetData {
  name: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal: string;
  billing_event: string;
  bid_strategy?: string;
  start_time?: string;
  end_time?: string;
  targeting: {
    geo_locations?: {
      countries?: string[];
      regions?: Array<{ key: string }>;
      cities?: Array<{ key: string; radius?: number; distance_unit?: string }>;
    };
    age_min?: number;
    age_max?: number;
    genders?: number[];
    interests?: Array<{ id: string; name?: string }>;
    behaviors?: Array<{ id: string; name?: string }>;
    custom_audiences?: string[];
    excluded_custom_audiences?: string[];
  };
}

interface CreateAdData {
  name: string;
  adset_id: string;
  creative: {
    title: string;
    body: string;
    image_url?: string;
    video_id?: string;
    call_to_action_type?: string;
    link_url?: string;
  };
  status?: string;
}

export class FacebookAdsService {
  private accessToken: string;
  private adAccountId: string;

  constructor() {
    this.accessToken = process.env.FB_PAGE_ACCESS_TOKEN || '';
    this.adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID || '';
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    try {
      const url = `${FB_BASE_URL}${endpoint}`;
      const params = method === 'GET' ? { access_token: this.accessToken, ...data } : { access_token: this.accessToken };
      
      const config = {
        method,
        url,
        ...(method === 'GET' ? { params } : { params, data }),
        timeout: 30000,
      };

      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error(`Facebook Ads API Error (${endpoint}):`, error.response?.data || error.message);
      throw new Error(`Facebook Ads API request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Ad Account Management
  async getAdAccounts(): Promise<AdAccount[]> {
    const response = await this.makeRequest('/me/adaccounts', 'GET', {
      fields: 'id,name,account_status,currency,timezone_name,spend_cap,balance'
    });
    return response.data || [];
  }

  async getAdAccountInsights(timeRange: string = 'last_7_days'): Promise<any> {
    const response = await this.makeRequest(`/${this.adAccountId}/insights`, 'GET', {
      time_range: timeRange,
      fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,cpp,actions'
    });
    return response.data?.[0] || {};
  }

  // Campaign Management
  async getCampaigns(): Promise<Campaign[]> {
    const response = await this.makeRequest(`/${this.adAccountId}/campaigns`, 'GET', {
      fields: 'id,name,objective,status,created_time,updated_time,start_time,stop_time,budget_remaining,daily_budget,lifetime_budget,spend_cap'
    });
    return response.data || [];
  }

  async createCampaign(campaignData: CreateCampaignData): Promise<{ id: string }> {
    const response = await this.makeRequest(`/${this.adAccountId}/campaigns`, 'POST', campaignData);
    return response;
  }

  async updateCampaign(campaignId: string, updateData: Partial<CreateCampaignData>): Promise<{ success: boolean }> {
    await this.makeRequest(`/${campaignId}`, 'POST', updateData);
    return { success: true };
  }

  async deleteCampaign(campaignId: string): Promise<{ success: boolean }> {
    await this.makeRequest(`/${campaignId}`, 'DELETE');
    return { success: true };
  }

  async getCampaignInsights(campaignId: string, timeRange: string = 'last_7_days'): Promise<AdInsights> {
    const response = await this.makeRequest(`/${campaignId}/insights`, 'GET', {
      time_range: timeRange,
      fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,cpp,actions,date_start,date_stop'
    });
    return response.data?.[0] || {};
  }

  // Ad Set Management
  async getAdSets(campaignId?: string): Promise<AdSet[]> {
    const endpoint = campaignId ? `/${campaignId}/adsets` : `/${this.adAccountId}/adsets`;
    const response = await this.makeRequest(endpoint, 'GET', {
      fields: 'id,name,campaign_id,status,daily_budget,lifetime_budget,start_time,end_time,targeting,optimization_goal,billing_event,bid_strategy'
    });
    return response.data || [];
  }

  async createAdSet(adSetData: CreateAdSetData): Promise<{ id: string }> {
    const response = await this.makeRequest(`/${this.adAccountId}/adsets`, 'POST', adSetData);
    return response;
  }

  async updateAdSet(adSetId: string, updateData: Partial<CreateAdSetData>): Promise<{ success: boolean }> {
    await this.makeRequest(`/${adSetId}`, 'POST', updateData);
    return { success: true };
  }

  async deleteAdSet(adSetId: string): Promise<{ success: boolean }> {
    await this.makeRequest(`/${adSetId}`, 'DELETE');
    return { success: true };
  }

  async getAdSetInsights(adSetId: string, timeRange: string = 'last_7_days'): Promise<AdInsights> {
    const response = await this.makeRequest(`/${adSetId}/insights`, 'GET', {
      time_range: timeRange,
      fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,cpp,actions,date_start,date_stop'
    });
    return response.data?.[0] || {};
  }

  // Ad Management
  async getAds(adSetId?: string): Promise<Ad[]> {
    const endpoint = adSetId ? `/${adSetId}/ads` : `/${this.adAccountId}/ads`;
    const response = await this.makeRequest(endpoint, 'GET', {
      fields: 'id,name,adset_id,campaign_id,status,creative{id,title,body,image_url,video_id},configured_status,effective_status'
    });
    return response.data || [];
  }

  async createAd(adData: CreateAdData): Promise<{ id: string }> {
    // First create ad creative
    const creativeResponse = await this.makeRequest(`/${this.adAccountId}/adcreatives`, 'POST', {
      name: `${adData.name} Creative`,
      object_story_spec: {
        page_id: process.env.FACEBOOK_PAGE_ID,
        link_data: {
          message: adData.creative.body,
          name: adData.creative.title,
          image_url: adData.creative.image_url,
          link: adData.creative.link_url,
          call_to_action: adData.creative.call_to_action_type ? {
            type: adData.creative.call_to_action_type,
            value: { link: adData.creative.link_url }
          } : undefined
        }
      }
    });

    // Then create ad with creative
    const response = await this.makeRequest(`/${this.adAccountId}/ads`, 'POST', {
      name: adData.name,
      adset_id: adData.adset_id,
      creative: { creative_id: creativeResponse.id },
      status: adData.status || 'PAUSED'
    });

    return response;
  }

  async updateAd(adId: string, updateData: Partial<CreateAdData>): Promise<{ success: boolean }> {
    await this.makeRequest(`/${adId}`, 'POST', updateData);
    return { success: true };
  }

  async deleteAd(adId: string): Promise<{ success: boolean }> {
    await this.makeRequest(`/${adId}`, 'DELETE');
    return { success: true };
  }

  async getAdInsights(adId: string, timeRange: string = 'last_7_days'): Promise<AdInsights> {
    const response = await this.makeRequest(`/${adId}/insights`, 'GET', {
      time_range: timeRange,
      fields: 'impressions,clicks,spend,reach,frequency,ctr,cpc,cpm,cpp,actions,date_start,date_stop'
    });
    return response.data?.[0] || {};
  }

  // Audience Management
  async getCustomAudiences(): Promise<any[]> {
    const response = await this.makeRequest(`/${this.adAccountId}/customaudiences`, 'GET', {
      fields: 'id,name,description,audience_size,delivery_status,operation_status,time_created,time_updated'
    });
    return response.data || [];
  }

  async createCustomAudience(audienceData: {
    name: string;
    description?: string;
    subtype: string;
    customer_file_source?: string;
  }): Promise<{ id: string }> {
    const response = await this.makeRequest(`/${this.adAccountId}/customaudiences`, 'POST', audienceData);
    return response;
  }

  async deleteCustomAudience(audienceId: string): Promise<{ success: boolean }> {
    await this.makeRequest(`/${audienceId}`, 'DELETE');
    return { success: true };
  }

  // Interest and Behavior Targeting
  async searchTargetingInterests(query: string, limit: number = 25): Promise<any[]> {
    const response = await this.makeRequest('/search', 'GET', {
      type: 'adinterest',
      q: query,
      limit
    });
    return response.data || [];
  }

  async searchTargetingBehaviors(query: string, limit: number = 25): Promise<any[]> {
    const response = await this.makeRequest('/search', 'GET', {
      type: 'behavior',
      q: query,
      limit
    });
    return response.data || [];
  }

  // Performance Analytics
  async getAccountPerformance(timeRange: string = 'last_30_days'): Promise<{
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    averageCPC: number;
    averageCPM: number;
    totalConversions: number;
    conversionRate: number;
  }> {
    const insights = await this.getAdAccountInsights(timeRange);
    
    const spend = parseFloat(insights.spend || '0');
    const impressions = parseInt(insights.impressions || '0');
    const clicks = parseInt(insights.clicks || '0');
    const conversions = insights.actions?.find((action: any) => action.action_type === 'purchase')?.value || '0';
    
    return {
      totalSpend: spend,
      totalImpressions: impressions,
      totalClicks: clicks,
      averageCTR: impressions > 0 ? (clicks / impressions) * 100 : 0,
      averageCPC: clicks > 0 ? spend / clicks : 0,
      averageCPM: impressions > 0 ? (spend / impressions) * 1000 : 0,
      totalConversions: parseInt(conversions),
      conversionRate: clicks > 0 ? (parseInt(conversions) / clicks) * 100 : 0
    };
  }

  // Automated Optimization
  async optimizeCampaignBudget(campaignId: string, performanceThreshold: number = 2.0): Promise<{
    action: string;
    oldBudget?: string;
    newBudget?: string;
    reason: string;
  }> {
    const insights = await this.getCampaignInsights(campaignId);
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign || !insights.cpc) {
      return {
        action: 'no_action',
        reason: 'Insufficient data for optimization'
      };
    }

    const currentCPC = parseFloat(insights.cpc);
    const currentBudget = parseFloat(campaign.daily_budget || '0');
    
    if (currentCPC < performanceThreshold && currentBudget > 0) {
      // Performance is good, increase budget by 20%
      const newBudget = Math.round(currentBudget * 1.2);
      await this.updateCampaign(campaignId, { daily_budget: newBudget.toString() });
      
      return {
        action: 'budget_increased',
        oldBudget: currentBudget.toString(),
        newBudget: newBudget.toString(),
        reason: `Good performance (CPC: $${currentCPC.toFixed(2)}), increased budget`
      };
    } else if (currentCPC > performanceThreshold * 2 && currentBudget > 10) {
      // Performance is poor, decrease budget by 15%
      const newBudget = Math.round(currentBudget * 0.85);
      await this.updateCampaign(campaignId, { daily_budget: newBudget.toString() });
      
      return {
        action: 'budget_decreased',
        oldBudget: currentBudget.toString(),
        newBudget: newBudget.toString(),
        reason: `Poor performance (CPC: $${currentCPC.toFixed(2)}), decreased budget`
      };
    }
    
    return {
      action: 'no_action',
      reason: `Performance within acceptable range (CPC: $${currentCPC.toFixed(2)})`
    };
  }
}

export const facebookAds = new FacebookAdsService();