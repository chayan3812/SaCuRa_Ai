import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Send, Pause, Play, Settings, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  scheduledTime: string;
  published: boolean;
  publishedAt?: string;
  facebookPostId?: string;
  pageId: string;
}

interface PostingSchedule {
  id: string;
  name: string;
  pageId: string;
  isActive: boolean;
  frequency: string;
  timeSlots: any[];
}

export default function ContentScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    scheduledTime: '',
    pageId: ''
  });

  // Fetch scheduled posts
  const { data: scheduledPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/content-scheduler/posts'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch posting schedules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['/api/content-scheduler/schedules']
  });

  // Fetch Facebook pages for dropdown
  const { data: pages = [] } = useQuery({
    queryKey: ['/api/dashboard/pages']
  });

  // Create scheduled post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/content-scheduler/posts', 'POST', postData);
    },
    onSuccess: () => {
      toast({
        title: "Post Scheduled",
        description: "Your post has been scheduled successfully",
        variant: "default"
      });
      setNewPost({ title: '', content: '', scheduledTime: '', pageId: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/content-scheduler/posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule post",
        variant: "destructive"
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/content-scheduler/posts/${postId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "Scheduled post has been deleted",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/content-scheduler/posts'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content || !newPost.scheduledTime || !newPost.pageId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Scheduler</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your Facebook posts</p>
        </div>
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Scheduler Settings
        </Button>
      </div>

      {/* Create New Scheduled Post */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Schedule New Post
          </CardTitle>
          <CardDescription>
            Create a new post to be automatically published to your Facebook page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page">Facebook Page</Label>
                <select
                  id="page"
                  value={newPost.pageId}
                  onChange={(e) => setNewPost(prev => ({ ...prev, pageId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a page</option>
                  {pages.map((page: any) => (
                    <option key={page.id} value={page.id}>
                      {page.pageName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={newPost.scheduledTime}
                onChange={(e) => setNewPost(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
            
            <Button type="submit" disabled={createPostMutation.isPending} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              {createPostMutation.isPending ? 'Scheduling...' : 'Schedule Post'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Posts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Posts ({scheduledPosts.length})
          </CardTitle>
          <CardDescription>
            Manage your upcoming and published posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading posts...</p>
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No scheduled posts yet</p>
              <p className="text-sm text-gray-500">Create your first scheduled post above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledPosts.map((post: ScheduledPost) => (
                <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(post.scheduledTime)}
                        </span>
                        {post.published && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Send className="h-3 w-3" />
                            Published {post.publishedAt && formatDateTime(post.publishedAt)}
                          </span>
                        )}
                        {post.facebookPostId && (
                          <span className="text-blue-600">FB: {post.facebookPostId}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {post.published ? 'Published' : 'Scheduled'}
                      </div>
                      {!post.published && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePostMutation.mutate(post.id)}
                          disabled={deletePostMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posting Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automatic Schedules
          </CardTitle>
          <CardDescription>
            Set up recurring posting schedules for your pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedulesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No automatic schedules configured</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((schedule: PostingSchedule) => (
                <div key={schedule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{schedule.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {schedule.frequency} • {schedule.timeSlots.length} time slots
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {schedule.isActive ? 'Active' : 'Paused'}
                      </div>
                      <Button variant="outline" size="sm">
                        {schedule.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}