/**
 * Simple Facebook Dashboard - Clean Interface
 * Simplified version incorporating your basic dashboard approach
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  useFacebookInsights, 
  useFacebookPosts, 
  useFacebookPublisher 
} from '@/hooks/useFacebookCore';
import { Facebook, Send, BarChart3, FileText, ExternalLink } from 'lucide-react';

export default function SimpleFacebookDashboard() {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
  // Hooks
  const { data: insights, isLoading: insightsLoading } = useFacebookInsights();
  const { data: posts, isLoading: postsLoading } = useFacebookPosts();
  const publishPost = useFacebookPublisher();

  const handlePost = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to post",
        variant: "destructive"
      });
      return;
    }

    try {
      await publishPost.mutateAsync(message);
      toast({
        title: "Post Published",
        description: "Your post has been published successfully"
      });
      setMessage('');
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Facebook className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Facebook Dashboard</h1>
          <p className="text-gray-600">Simple Facebook management interface</p>
        </div>
      </div>

      {/* Post Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Create Post</span>
          </CardTitle>
          <CardDescription>
            Compose and publish posts to your Facebook page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's happening?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={handlePost}
            disabled={publishPost.isPending || !message.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {publishPost.isPending ? "Publishing..." : "Post to Facebook"}
          </Button>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Page Insights</span>
          </CardTitle>
          <CardDescription>
            Real-time performance metrics for your Facebook page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : insights ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.totalImpressions ? formatNumber(insights.totalImpressions) : '0'}
                </div>
                <div className="text-sm text-gray-600">Impressions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {insights.totalEngagement ? formatNumber(insights.totalEngagement) : '0'}
                </div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {insights.averageEngagementRate ? `${insights.averageEngagementRate.toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Eng. Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.totalReach ? formatNumber(insights.totalReach) : '0'}
                </div>
                <div className="text-sm text-gray-600">Reach</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No insights data available</p>
              <p className="text-sm text-gray-400">Connect your Facebook page to see metrics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Posts</span>
          </CardTitle>
          <CardDescription>
            Your latest Facebook posts and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts && posts.data && posts.data.length > 0 ? (
            <div className="space-y-4">
              {posts.data.slice(0, 5).map((post: any, index: number) => (
                <div key={post.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm mb-2 line-clamp-2">
                        {post.message || 'No message content'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {post.created_time ? new Date(post.created_time).toLocaleDateString() : 'Unknown date'}
                        </span>
                        <span>{post.likes?.summary?.total_count || 0} likes</span>
                        <span>{post.comments?.summary?.total_count || 0} comments</span>
                        <span>{post.shares?.count || 0} shares</span>
                      </div>
                    </div>
                    <a
                      href={`https://www.facebook.com/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No posts found</p>
              <p className="text-sm text-gray-400">Create your first post above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}