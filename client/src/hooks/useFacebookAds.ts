/**
 * Facebook Ads API Integration Hooks
 * Advanced advertising management with comprehensive React Query integration
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Type definitions
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

// Ad Account Hooks
export const useAdAccounts = () => {
  return useQuery({
    queryKey: ['/api/facebook-ads/accounts'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

export const useAdAccountInsights = (timeRange: string = 'last_7_days') => {
  return useQuery({
    queryKey: ['/api/facebook-ads/account/insights', timeRange],
    queryFn: () => apiRequest(`/api/facebook-ads/account/insights?timeRange=${timeRange}`),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  });
};

export const useAccountPerformance = (timeRange: string = 'last_30_days') => {
  return useQuery({
    queryKey: ['/api/facebook-ads/performance', timeRange],
    queryFn: () => apiRequest(`/api/facebook-ads/performance?timeRange=${timeRange}`),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

// Campaign Hooks
export const useCampaigns = () => {
  return useQuery({
    queryKey: ['/api/facebook-ads/campaigns'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useCampaignInsights = (campaignId: string, timeRange: string = 'last_7_days') => {
  return useQuery({
    queryKey: ['/api/facebook-ads/campaigns', campaignId, 'insights', timeRange],
    queryFn: () => apiRequest(`/api/facebook-ads/campaigns/${campaignId}/insights?timeRange=${timeRange}`),
    enabled: !!campaignId,
    staleTime: 15 * 60 * 1000,
    retry: 2
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignData: CreateCampaignData) =>
      apiRequest('/api/facebook-ads/campaigns', 'POST', campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/performance'] });
    }
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, updateData }: { campaignId: string; updateData: Partial<CreateCampaignData> }) =>
      apiRequest(`/api/facebook-ads/campaigns/${campaignId}`, 'PUT', updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/campaigns'] });
    }
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignId: string) =>
      apiRequest(`/api/facebook-ads/campaigns/${campaignId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/performance'] });
    }
  });
};

export const useOptimizeCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ campaignId, performanceThreshold }: { campaignId: string; performanceThreshold?: number }) =>
      apiRequest(`/api/facebook-ads/campaigns/${campaignId}/optimize`, 'POST', { performanceThreshold }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/campaigns'] });
    }
  });
};

// Ad Set Hooks
export const useAdSets = (campaignId?: string) => {
  const queryParams = campaignId ? `?campaignId=${campaignId}` : '';
  
  return useQuery({
    queryKey: ['/api/facebook-ads/adsets', campaignId],
    queryFn: () => apiRequest(`/api/facebook-ads/adsets${queryParams}`),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

export const useAdSetInsights = (adSetId: string, timeRange: string = 'last_7_days') => {
  return useQuery({
    queryKey: ['/api/facebook-ads/adsets', adSetId, 'insights', timeRange],
    queryFn: () => apiRequest(`/api/facebook-ads/adsets/${adSetId}/insights?timeRange=${timeRange}`),
    enabled: !!adSetId,
    staleTime: 15 * 60 * 1000,
    retry: 2
  });
};

export const useCreateAdSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adSetData: CreateAdSetData) =>
      apiRequest('/api/facebook-ads/adsets', 'POST', adSetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/adsets'] });
    }
  });
};

export const useUpdateAdSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adSetId, updateData }: { adSetId: string; updateData: Partial<CreateAdSetData> }) =>
      apiRequest(`/api/facebook-ads/adsets/${adSetId}`, 'PUT', updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/adsets'] });
    }
  });
};

export const useDeleteAdSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adSetId: string) =>
      apiRequest(`/api/facebook-ads/adsets/${adSetId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/adsets'] });
    }
  });
};

// Ad Hooks
export const useAds = (adSetId?: string) => {
  const queryParams = adSetId ? `?adSetId=${adSetId}` : '';
  
  return useQuery({
    queryKey: ['/api/facebook-ads/ads', adSetId],
    queryFn: () => apiRequest(`/api/facebook-ads/ads${queryParams}`),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

export const useAdInsights = (adId: string, timeRange: string = 'last_7_days') => {
  return useQuery({
    queryKey: ['/api/facebook-ads/ads', adId, 'insights', timeRange],
    queryFn: () => apiRequest(`/api/facebook-ads/ads/${adId}/insights?timeRange=${timeRange}`),
    enabled: !!adId,
    staleTime: 15 * 60 * 1000,
    retry: 2
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adData: CreateAdData) =>
      apiRequest('/api/facebook-ads/ads', 'POST', adData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/ads'] });
    }
  });
};

export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ adId, updateData }: { adId: string; updateData: Partial<CreateAdData> }) =>
      apiRequest(`/api/facebook-ads/ads/${adId}`, 'PUT', updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/ads'] });
    }
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (adId: string) =>
      apiRequest(`/api/facebook-ads/ads/${adId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/ads'] });
    }
  });
};

// Audience Hooks
export const useCustomAudiences = () => {
  return useQuery({
    queryKey: ['/api/facebook-ads/audiences'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

export const useCreateCustomAudience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (audienceData: { name: string; description?: string; subtype: string; customer_file_source?: string }) =>
      apiRequest('/api/facebook-ads/audiences', 'POST', audienceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/audiences'] });
    }
  });
};

export const useDeleteCustomAudience = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (audienceId: string) =>
      apiRequest(`/api/facebook-ads/audiences/${audienceId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook-ads/audiences'] });
    }
  });
};

// Targeting Hooks
export const useSearchTargetingInterests = (query: string, limit: number = 25) => {
  return useQuery({
    queryKey: ['/api/facebook-ads/targeting/interests', query, limit],
    queryFn: () => apiRequest(`/api/facebook-ads/targeting/interests?query=${encodeURIComponent(query)}&limit=${limit}`),
    enabled: query.length >= 3,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2
  });
};

export const useSearchTargetingBehaviors = (query: string, limit: number = 25) => {
  return useQuery({
    queryKey: ['/api/facebook-ads/targeting/behaviors', query, limit],
    queryFn: () => apiRequest(`/api/facebook-ads/targeting/behaviors?query=${encodeURIComponent(query)}&limit=${limit}`),
    enabled: query.length >= 3,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2
  });
};

// Combined Dashboard Hook
export const useFacebookAdsDashboard = () => {
  const accounts = useAdAccounts();
  const campaigns = useCampaigns();
  const performance = useAccountPerformance();
  const audiences = useCustomAudiences();

  return {
    accounts: {
      data: accounts.data,
      isLoading: accounts.isLoading,
      error: accounts.error
    },
    campaigns: {
      data: campaigns.data,
      isLoading: campaigns.isLoading,
      error: campaigns.error
    },
    performance: {
      data: performance.data,
      isLoading: performance.isLoading,
      error: performance.error
    },
    audiences: {
      data: audiences.data,
      isLoading: audiences.isLoading,
      error: audiences.error
    },
    isLoading: accounts.isLoading || campaigns.isLoading || performance.isLoading,
    hasError: !!(accounts.error || campaigns.error || performance.error)
  };
};

// Utility functions
export const formatCurrency = (amount: string | number, currency: string = 'USD'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(numAmount);
};

export const formatPercentage = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numValue.toFixed(2)}%`;
};

export const calculateROAS = (conversions: number, conversionValue: number, spend: number): number => {
  if (spend === 0) return 0;
  return (conversions * conversionValue) / spend;
};

export const getCampaignStatus = (campaign: Campaign): { status: string; color: string } => {
  switch (campaign.status) {
    case 'ACTIVE':
      return { status: 'Active', color: 'green' };
    case 'PAUSED':
      return { status: 'Paused', color: 'yellow' };
    case 'DELETED':
      return { status: 'Deleted', color: 'red' };
    case 'ARCHIVED':
      return { status: 'Archived', color: 'gray' };
    default:
      return { status: campaign.status, color: 'gray' };
  }
};

export const getOptimizationRecommendations = (insights: AdInsights): string[] => {
  const recommendations: string[] = [];
  
  const ctr = parseFloat(insights.ctr || '0');
  const cpc = parseFloat(insights.cpc || '0');
  const frequency = parseFloat(insights.frequency || '0');
  
  if (ctr < 1.0) {
    recommendations.push('Consider improving ad creative to increase click-through rate');
  }
  
  if (cpc > 2.0) {
    recommendations.push('Cost per click is high - consider refining audience targeting');
  }
  
  if (frequency > 3.0) {
    recommendations.push('Ad frequency is high - consider refreshing creative or expanding audience');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance looks good - consider scaling successful campaigns');
  }
  
  return recommendations;
};