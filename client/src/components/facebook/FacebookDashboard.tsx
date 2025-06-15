/**
 * Production Facebook Management Dashboard
 * Comprehensive Facebook integration with live API capabilities
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { 
  useFacebookDashboard, 
  usePublishPost, 
  useSchedulePost,
  useUploadMedia,
  processFacebookInsights,
  formatPostData,
  calculatePostPerformance
} from "@/hooks/useFacebookAPI";
import {
  Facebook,
  Upload,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  MessageSquare,
  Share2,
  Heart,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Image,
  Brain
} from "lucide-react";
import AIContentOptimizer from './AIContentOptimizer';

interface PostFormData {
  message: string;
  link: string;
  picture: string;
  publishTime: string;
}

interface LinkPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

export default function FacebookDashboard() {
  const { toast } = useToast();
  const [postForm, setPostForm] = useState<PostFormData>({
    message: "",
    link: "",
    picture: "",
    publishTime: ""
  });
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Facebook API hooks
  const facebookData = useFacebookDashboard();
  const publishPost = usePublishPost();
  const schedulePost = useSchedulePost();
  const uploadMedia = useUploadMedia();

  const handlePublishPost = async () => {
    if (!postForm.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message for your post",
        variant: "destructive"
      });
      return;
    }

    try {
      const postData = {
        message: postForm.message,
        ...(postForm.link && { link: postForm.link }),
        ...(postForm.picture && { picture: postForm.picture })
      };

      await publishPost.mutateAsync(postData);
      
      toast({
        title: "Post Published",
        description: "Your post has been published successfully to Facebook",
      });

      setPostForm({ message: "", link: "", picture: "", publishTime: "" });
    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish post. Please check your Facebook connection.",
        variant: "destructive"
      });
    }
  };

  const handleSchedulePost = async () => {
    if (!postForm.message.trim() || !postForm.publishTime) {
      toast({
        title: "Missing Information",
        description: "Please enter both message and publish time",
        variant: "destructive"
      });
      return;
    }

    try {
      const postData = {
        message: postForm.message,
        ...(postForm.link && { link: postForm.link }),
        ...(postForm.picture && { picture: postForm.picture })
      };

      await schedulePost.mutateAsync({ postData, publishTime: postForm.publishTime });
      
      toast({
        title: "Post Scheduled",
        description: "Your post has been scheduled successfully",
      });

      setPostForm({ message: "", link: "", picture: "", publishTime: "" });
    } catch (error) {
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "File Required",
        description: "Please select an image file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("caption", postForm.message);

      const response = await axios.post("/api/facebook/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast({
        title: "Image Posted",
        description: "Your image has been posted to Facebook successfully",
      });

      setUploadedFile(null);
      setPostForm({ message: "", link: "", picture: "", publishTime: "" });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please check your Facebook connection.",
        variant: "destructive"
      });
    }
  };

  const handleLinkPreview = async () => {
    if (!postForm.link.trim()) {
      toast({
        title: "Link Required",
        description: "Please enter a valid URL for preview",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingPreview(true);
    try {
      const response = await axios.post("/api/facebook/link", { 
        link: postForm.link 
      });
      
      setLinkPreview(response.data);
      
      toast({
        title: "Preview Loaded",
        description: "Link preview has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Failed to load link preview. Please check the URL.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!mediaUrl.trim()) {
      toast({
        title: "Media URL Required",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadMedia.mutateAsync({ 
        imageUrl: mediaUrl, 
        caption: mediaCaption || undefined 
      });
      
      toast({
        title: "Media Uploaded",
        description: "Media has been uploaded successfully to Facebook",
      });

      setMediaUrl("");
      setMediaCaption("");
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please check the URL and try again.",
        variant: "destructive"
      });
    }
  };

  // Process Facebook data
  const insights = facebookData.insights.data ? processFacebookInsights(facebookData.insights.data) : null;
  const posts = facebookData.posts.data ? formatPostData(facebookData.posts.data) : [];
  const performance = posts.length > 0 ? calculatePostPerformance(facebookData.posts.data || []) : null;

  const connectionStatus = facebookData.validation.data?.valid ? 'connected' : 'disconnected';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facebook Management</h1>
          <p className="text-muted-foreground">
            Manage your Facebook presence with advanced AI-powered automation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Facebook className="h-5 w-5" />
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.totalImpressions.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.averageEngagementRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.totalPosts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance ? Math.round((performance.averageLikes + performance.averageComments + performance.averageShares)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per post
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Create Posts</TabsTrigger>
          <TabsTrigger value="media">Upload Media</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
        </TabsList>

        {/* Create Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create & Schedule Posts</CardTitle>
              <CardDescription>
                Create new posts and schedule them for optimal engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Post Message</Label>
                <Textarea
                  id="message"
                  placeholder="What's on your mind?"
                  value={postForm.message}
                  onChange={(e) => setPostForm({ ...postForm, message: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Link (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="link"
                      placeholder="https://example.com"
                      value={postForm.link}
                      onChange={(e) => setPostForm({ ...postForm, link: e.target.value })}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleLinkPreview}
                      disabled={isLoadingPreview}
                    >
                      {isLoadingPreview ? "Loading..." : "Preview"}
                    </Button>
                  </div>
                  {linkPreview && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="flex gap-3">
                        {linkPreview.image && (
                          <img 
                            src={linkPreview.image} 
                            alt="Link preview" 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{linkPreview.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{linkPreview.description}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{linkPreview.url}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="picture">Picture URL (Optional)</Label>
                  <Input
                    id="picture"
                    placeholder="https://example.com/image.jpg"
                    value={postForm.picture}
                    onChange={(e) => setPostForm({ ...postForm, picture: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishTime">Schedule Time (Optional)</Label>
                <Input
                  id="publishTime"
                  type="datetime-local"
                  value={postForm.publishTime}
                  onChange={(e) => setPostForm({ ...postForm, publishTime: e.target.value })}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handlePublishPost} 
                  disabled={publishPost.isPending}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {publishPost.isPending ? 'Publishing...' : 'Publish Now'}
                </Button>
                
                <Button 
                  onClick={handleSchedulePost} 
                  disabled={schedulePost.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {schedulePost.isPending ? 'Scheduling...' : 'Schedule Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Upload images directly from your device or provide a URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="fileUpload">📤 Upload Image File</Label>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {uploadedFile && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-300">
                        File selected: {uploadedFile.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* URL Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="mediaUrl">🔗 Image URL</Label>
                <Input
                  id="mediaUrl"
                  placeholder="https://example.com/image.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>

              {/* Caption Section */}
              <div className="space-y-2">
                <Label htmlFor="mediaCaption">💬 Caption</Label>
                <Textarea
                  id="mediaCaption"
                  placeholder="Write a caption for your image..."
                  value={postForm.message}
                  onChange={(e) => setPostForm({ ...postForm, message: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Upload Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={handleFileUpload} 
                  disabled={!uploadedFile}
                  variant={uploadedFile ? "default" : "outline"}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Selected File
                </Button>
                
                <Button 
                  onClick={handleUploadMedia} 
                  disabled={uploadMedia.isPending || !mediaUrl.trim()}
                  variant={mediaUrl.trim() ? "default" : "outline"}
                  className="w-full"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {uploadMedia.isPending ? 'Uploading...' : 'Upload from URL'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <span>Average Likes</span>
                    </div>
                    <span className="font-bold">{performance?.averageLikes || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Average Comments</span>
                    </div>
                    <span className="font-bold">{performance?.averageComments || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2 text-green-500" />
                      <span>Average Shares</span>
                    </div>
                    <span className="font-bold">{performance?.averageShares || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Information</CardTitle>
              </CardHeader>
              <CardContent>
                {facebookData.pageInfo.data ? (
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Page Name:</span>
                      <span className="ml-2">{facebookData.pageInfo.data.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2">{facebookData.pageInfo.data.category || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Can Post:</span>
                      <Badge variant={facebookData.pageInfo.data.can_post ? 'default' : 'destructive'}>
                        {facebookData.pageInfo.data.can_post ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading page information...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Posts Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>
                Your latest Facebook posts and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {facebookData.posts.isLoading ? (
                <p className="text-muted-foreground">Loading posts...</p>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <p className="mb-2">{post.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.engagement.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {post.engagement.comments}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {post.engagement.shares}
                        </span>
                        <span className="ml-auto">
                          {post.createdTime.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No posts found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}