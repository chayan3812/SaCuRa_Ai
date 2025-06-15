/**
 * Core Facebook API Hooks - Simplified Interface
 * Provides basic Facebook operations with clean, simple API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Core insights hook - simplified interface
export const useFacebookInsights = () => {
  return useQuery({
    queryKey: ['/api/facebook/insights'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

// Core posts fetching hook
export const useFacebookPosts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['/api/facebook/posts', limit],
    queryFn: async () => {
      return await apiRequest(`/api/facebook/posts?limit=${limit}`);
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

// Core post publishing hook
export const useFacebookPublisher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/facebook/post', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: () => {
      // Invalidate posts cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
    }
  });
};

// Page information hook
export const useFacebookPageInfo = () => {
  return useQuery({
    queryKey: ['/api/facebook/page-info'],
    staleTime: 3600000, // Cache for 1 hour
  });
};

// Simplified post engagement hook
export const useFacebookPostEngagement = (postId: string) => {
  return useQuery({
    queryKey: ['/api/facebook/post-engagement', postId],
    queryFn: async () => {
      return await apiRequest(`/api/facebook/post-engagement/${postId}`);
    },
    enabled: !!postId,
  });
};

// Media upload hook
export const useFacebookMediaUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ imageUrl, caption }: { imageUrl: string; caption?: string }) => {
      return await apiRequest('/api/facebook/upload-media', {
        method: 'POST',
        body: JSON.stringify({ imageUrl, caption })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
    }
  });
};

// Scheduled post hook
export const useFacebookScheduler = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ message, publishTime, link, picture }: {
      message: string;
      publishTime: string;
      link?: string;
      picture?: string;
    }) => {
      return await apiRequest('/api/facebook/schedule-post', {
        method: 'POST',
        body: JSON.stringify({ message, publishTime, link, picture })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
    }
  });
};

// Core Facebook status hook
export const useFacebookStatus = () => {
  return useQuery({
    queryKey: ['/api/facebook/status'],
    refetchInterval: 30000, // Check status every 30 seconds
  });
};