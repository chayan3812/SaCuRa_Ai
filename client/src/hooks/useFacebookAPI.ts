/**
 * Facebook API Integration Hook
 * Production-ready React hooks for Facebook Graph API operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

interface PageInsights {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time: string;
  }>;
}

interface PublishPostData {
  message: string;
  link?: string;
  picture?: string;
  scheduled_publish_time?: number;
}

export const useFacebookValidation = () => {
  return useQuery({
    queryKey: ['/api/facebook/validate'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useFacebookInsights = (metrics?: string[]) => {
  const queryParams = metrics ? `?metrics=${metrics.join(',')}` : '';
  
  return useQuery({
    queryKey: ['/api/facebook/insights', metrics],
    queryFn: () => apiRequest(`/api/facebook/insights${queryParams}`, 'GET'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
};

export const useFacebookPosts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['/api/facebook/posts', limit],
    queryFn: () => apiRequest(`/api/facebook/posts?limit=${limit}`, 'GET'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

export const useFacebookPageInfo = () => {
  return useQuery({
    queryKey: ['/api/facebook/page-info'],
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

export const usePostEngagement = (postId: string) => {
  return useQuery({
    queryKey: ['/api/facebook/post', postId, 'engagement'],
    queryFn: () => apiRequest(`/api/facebook/post/${postId}/engagement`, 'GET'),
    enabled: !!postId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2
  });
};

export const useFacebookAudienceInsights = () => {
  return useQuery({
    queryKey: ['/api/facebook/audience-insights'],
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2
  });
};

export const usePublishPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postData: PublishPostData) => 
      apiRequest('/api/facebook/post', 'POST', postData),
    onSuccess: () => {
      // Invalidate posts cache to show new post
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/insights'] });
    }
  });
};

export const useSchedulePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postData, publishTime }: { postData: PublishPostData; publishTime: string }) => 
      apiRequest('/api/facebook/schedule-post', 'POST', { 
        ...postData, 
        publishTime 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
    }
  });
};

export const useUploadMedia = () => {
  return useMutation({
    mutationFn: ({ imageUrl, caption }: { imageUrl: string; caption?: string }) =>
      apiRequest('/api/facebook/upload-media', 'POST', { imageUrl, caption })
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => 
      apiRequest(`/api/facebook/post/${postId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/insights'] });
    }
  });
};

export const useGetLongLivedToken = () => {
  return useMutation({
    mutationFn: (shortLivedToken: string) =>
      apiRequest('/api/facebook/token/long-lived', 'POST', { shortLivedToken })
  });
};

export const useGetPageTokens = () => {
  return useMutation({
    mutationFn: (userAccessToken: string) =>
      apiRequest(`/api/facebook/page-tokens?userAccessToken=${userAccessToken}`, 'GET')
  });
};

// Combined hook for comprehensive Facebook data
export const useFacebookDashboard = () => {
  const validation = useFacebookValidation();
  const pageInfo = useFacebookPageInfo();
  const posts = useFacebookPosts(5);
  const insights = useFacebookInsights(['page_impressions', 'page_engaged_users']);
  const audienceInsights = useFacebookAudienceInsights();

  return {
    validation: {
      data: validation.data,
      isLoading: validation.isLoading,
      error: validation.error
    },
    pageInfo: {
      data: pageInfo.data,
      isLoading: pageInfo.isLoading,
      error: pageInfo.error
    },
    posts: {
      data: posts.data,
      isLoading: posts.isLoading,
      error: posts.error
    },
    insights: {
      data: insights.data,
      isLoading: insights.isLoading,
      error: insights.error
    },
    audienceInsights: {
      data: audienceInsights.data,
      isLoading: audienceInsights.isLoading,
      error: audienceInsights.error
    },
    isLoading: validation.isLoading || pageInfo.isLoading || posts.isLoading,
    hasError: !!(validation.error || pageInfo.error || posts.error)
  };
};

// Utility functions for processing Facebook data
export const processFacebookInsights = (insights: PageInsights[]): {
  totalImpressions: number;
  totalEngagement: number;
  averageEngagementRate: number;
} => {
  if (!insights || insights.length === 0) {
    return {
      totalImpressions: 0,
      totalEngagement: 0,
      averageEngagementRate: 0
    };
  }

  const impressionsData = insights.find(insight => insight.name === 'page_impressions');
  const engagementData = insights.find(insight => insight.name === 'page_engaged_users');

  const totalImpressions = impressionsData?.values.reduce((sum, value) => sum + value.value, 0) || 0;
  const totalEngagement = engagementData?.values.reduce((sum, value) => sum + value.value, 0) || 0;

  const averageEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

  return {
    totalImpressions,
    totalEngagement,
    averageEngagementRate: Math.round(averageEngagementRate * 100) / 100
  };
};

export const formatPostData = (posts: FacebookPost[]) => {
  return posts.map(post => ({
    id: post.id,
    message: post.message || 'No message',
    createdTime: new Date(post.created_time),
    engagement: {
      likes: post.likes?.summary?.total_count || 0,
      comments: post.comments?.summary?.total_count || 0,
      shares: post.shares?.count || 0,
      total: (post.likes?.summary?.total_count || 0) + 
             (post.comments?.summary?.total_count || 0) + 
             (post.shares?.count || 0)
    }
  }));
};

export const calculatePostPerformance = (posts: FacebookPost[]) => {
  if (!posts || posts.length === 0) {
    return {
      averageLikes: 0,
      averageComments: 0,
      averageShares: 0,
      totalPosts: 0,
      bestPerforming: null
    };
  }

  const formattedPosts = formatPostData(posts);
  const totalPosts = formattedPosts.length;

  const totals = formattedPosts.reduce(
    (acc, post) => ({
      likes: acc.likes + post.engagement.likes,
      comments: acc.comments + post.engagement.comments,
      shares: acc.shares + post.engagement.shares
    }),
    { likes: 0, comments: 0, shares: 0 }
  );

  const bestPerforming = formattedPosts.reduce((best, current) => 
    current.engagement.total > (best?.engagement.total || 0) ? current : best,
    formattedPosts[0]
  );

  return {
    averageLikes: Math.round(totals.likes / totalPosts),
    averageComments: Math.round(totals.comments / totalPosts),
    averageShares: Math.round(totals.shares / totalPosts),
    totalPosts,
    bestPerforming
  };
};