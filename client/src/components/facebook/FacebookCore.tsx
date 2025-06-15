/**
 * Facebook Core Integration Component
 * Simplified interface for essential Facebook operations
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  useFacebookInsights, 
  useFacebookPosts, 
  useFacebookPublisher, 
  useFacebookPageInfo,
  useFacebookScheduler,
  useFacebookMediaUpload 
} from '@/hooks/useFacebookCore';
import { 
  Facebook, 
  TrendingUp, 
  MessageSquare, 
  Send, 
  Calendar, 
  Image,
  BarChart3,
  Users,
  Heart,
  Share2
} from 'lucide-react';

export default function FacebookCore() {
  const [postMessage, setPostMessage] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const { toast } = useToast();
  
  // Core hooks
  const { data: insights, isLoading: insightsLoading } = useFacebookInsights();
  const { data: posts, isLoading: postsLoading } = useFacebookPosts(5);
  const { data: pageInfo, isLoading: pageLoading } = useFacebookPageInfo();
  
  // Mutations
  const publishPost = useFacebookPublisher();
  const schedulePost = useFacebookScheduler();
  const uploadMedia = useFacebookMediaUpload();

  const handlePublishPost = async () => {
    if (!postMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to post",
        variant: "destructive"
      });
      return;
    }

    try {
      await publishPost.mutateAsync(postMessage);
      toast({
        title: "Post Published",
        description: "Your post has been published successfully"
      });
      setPostMessage('');
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSchedulePost = async () => {
    if (!postMessage.trim() || !scheduleTime) {
      toast({
        title: "Missing Information",
        description: "Please enter both message and schedule time",
        variant: "destructive"
      });
      return;
    }

    try {
      await schedulePost.mutateAsync({
        message: postMessage,
        publishTime: scheduleTime,
        link: linkUrl || undefined
      });
      toast({
        title: "Post Scheduled",
        description: "Your post has been scheduled successfully"
      });
      setPostMessage('');
      setScheduleTime('');
      setLinkUrl('');
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadMedia = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Image URL Required",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadMedia.mutateAsync({
        imageUrl,
        caption: postMessage || undefined
      });
      toast({
        title: "Media Uploaded",
        description: "Your image has been uploaded successfully"
      });
      setImageUrl('');
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Facebook className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Facebook Core</h2>
        <Badge variant="secondary">Live Integration</Badge>
      </div>

      {/* Page Information */}
      {pageInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Page Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Page Name</div>
                <div className="font-medium">{pageInfo.name || 'Not Available'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div className="font-medium">{pageInfo.category || 'Not Available'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Followers</div>
                <div className="font-medium">{pageInfo.fan_count ? formatNumber(pageInfo.fan_count) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <Badge variant={pageInfo.can_post ? "default" : "secondary"}>
                  {pageInfo.can_post ? "Can Post" : "Limited"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Quick Insights</span>
          </CardTitle>
          <CardDescription>
            Latest page performance metrics
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
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.totalImpressions ? formatNumber(insights.totalImpressions) : '0'}
                </div>
                <div className="text-sm text-gray-500">Impressions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.totalEngagement ? formatNumber(insights.totalEngagement) : '0'}
                </div>
                <div className="text-sm text-gray-500">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {insights.averageEngagementRate ? `${insights.averageEngagementRate.toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-500">Eng. Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.totalReach ? formatNumber(insights.totalReach) : '0'}
                </div>
                <div className="text-sm text-gray-500">Reach</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No insights data available</div>
          )}
        </CardContent>
      </Card>

      {/* Post Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Create Post</span>
          </CardTitle>
          <CardDescription>
            Publish immediately or schedule for later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Post Message</Label>
            <Textarea
              id="message"
              placeholder="What's happening?"
              value={postMessage}
              onChange={(e) => setPostMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="link">Link (Optional)</Label>
              <Input
                id="link"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="schedule">Schedule Time (Optional)</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handlePublishPost}
              disabled={publishPost.isPending}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {publishPost.isPending ? "Publishing..." : "Publish Now"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleSchedulePost}
              disabled={schedulePost.isPending || !scheduleTime}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {schedulePost.isPending ? "Scheduling..." : "Schedule Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Upload Media</span>
          </CardTitle>
          <CardDescription>
            Upload images to your Facebook page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleUploadMedia}
            disabled={uploadMedia.isPending}
            className="w-full"
          >
            <Image className="h-4 w-4 mr-2" />
            {uploadMedia.isPending ? "Uploading..." : "Upload Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
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
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts && posts.data && posts.data.length > 0 ? (
            <div className="space-y-4">
              {posts.data.slice(0, 5).map((post: any, index: number) => (
                <div key={post.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        {post.message || 'No message content'}
                      </p>
                      <div className="text-xs text-gray-400">
                        {post.created_time ? new Date(post.created_time).toLocaleDateString() : 'Unknown date'}
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes?.summary?.total_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{post.comments?.summary?.total_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="h-3 w-3" />
                        <span>{post.shares?.count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No posts found</p>
              <p className="text-sm">Create your first post above to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}