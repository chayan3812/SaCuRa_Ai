import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Send,
  ImageIcon,
  Hash,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock4
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { ContentQueue, ContentTemplate, PostingSchedule } from "@shared/schema";

const newPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  pageId: z.string().min(1, "Page is required"),
  scheduledFor: z.string().min(1, "Schedule date is required"),
  postType: z.enum(["text", "image", "video", "link", "carousel"]),
  hashtags: z.string().optional(),
  targetAudience: z.string().optional(),
});

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  category: z.enum(["promotion", "engagement", "educational", "seasonal", "announcement"]),
  content: z.string().min(1, "Content is required"),
  hashtags: z.string().optional(),
  variables: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const scheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  pageId: z.string().min(1, "Page is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  timezone: z.string().default("UTC"),
  timeSlots: z.string().min(1, "Time slots are required"),
  autoGenerate: z.boolean().default(false),
  contentType: z.enum(["mixed", "promotional", "educational", "engagement"]),
});

export default function ContentQueue() {
  const [activeTab, setActiveTab] = useState("queue");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: contentQueue = [] } = useQuery<ContentQueue[]>({
    queryKey: ["/api/content-queue"],
  });

  const { data: templates = [] } = useQuery<ContentTemplate[]>({
    queryKey: ["/api/content-templates"],
  });

  const { data: schedules = [] } = useQuery<PostingSchedule[]>({
    queryKey: ["/api/posting-schedules"],
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["/api/facebook/pages"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newPostSchema>) => {
      const hashtags = data.hashtags?.split(',').map(tag => tag.trim()).filter(Boolean) || [];
      const targetAudience = data.targetAudience ? JSON.parse(data.targetAudience) : null;
      
      return apiRequest("/api/content-queue", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          hashtags,
          targetAudience,
          scheduledFor: new Date(data.scheduledFor),
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-queue"] });
      setShowNewPostDialog(false);
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof templateSchema>) => {
      const hashtags = data.hashtags?.split(',').map(tag => tag.trim()).filter(Boolean) || [];
      const variables = data.variables?.split(',').map(v => v.trim()).filter(Boolean) || [];
      
      return apiRequest("/api/content-templates", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          hashtags,
          variables,
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-templates"] });
      setShowTemplateDialog(false);
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof scheduleSchema>) => {
      const timeSlots = JSON.parse(data.timeSlots);
      
      return apiRequest("/api/posting-schedules", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          timeSlots,
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posting-schedules"] });
      setShowScheduleDialog(false);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => apiRequest(`/api/content-queue/${postId}`, {
      method: "DELETE",
      body: undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-queue"] });
    },
  });

  const postForm = useForm<z.infer<typeof newPostSchema>>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      postType: "text",
    },
  });

  const templateForm = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      category: "promotion",
      isPublic: false,
    },
  });

  const scheduleForm = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      frequency: "daily",
      timezone: "UTC",
      autoGenerate: false,
      contentType: "mixed",
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock4 className="h-4 w-4 text-blue-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "draft":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Queue</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule, manage, and track your social media content
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowNewPostDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Content Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid gap-4">
            {contentQueue.map((post) => (
              <Card key={post.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(post.status)}
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {format(new Date(post.scheduledFor), "MMM dd, yyyy HH:mm")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePostMutation.mutate(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                    
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-blue-500" />
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{post.postType}</span>
                        </div>
                        {post.seoScore && (
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4" />
                            <span>SEO: {post.seoScore}/100</span>
                          </div>
                        )}
                        {post.estimatedReach && (
                          <div className="flex items-center space-x-1">
                            <Send className="h-4 w-4" />
                            <span>Est. Reach: {post.estimatedReach}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {contentQueue.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No scheduled content yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowNewPostDialog(true)}
                  >
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{template.category}</Badge>
                    {template.isPublic && (
                      <Badge variant="secondary" className="ml-2">Public</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {template.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Used {template.useCount} times</span>
                    <span>{template.hashtags?.length || 0} hashtags</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{schedule.name}</CardTitle>
                    <Badge className={schedule.isActive ? 
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : 
                      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    }>
                      {schedule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {schedule.frequency} • {schedule.contentType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Timezone: {schedule.timezone}</span>
                    </div>
                    {schedule.autoGenerate && (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4 text-blue-500" />
                        <span>Auto-generates content</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Post Dialog */}
      <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Post</DialogTitle>
            <DialogDescription>
              Create and schedule content for your Facebook pages
            </DialogDescription>
          </DialogHeader>
          <Form {...postForm}>
            <form onSubmit={postForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
              <FormField
                control={postForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={postForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your post content..." 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={postForm.control}
                  name="pageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Page</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select page" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(pages) ? pages.map((page: any) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.name}
                            </SelectItem>
                          )) : []}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={postForm.control}
                  name="postType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="carousel">Carousel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={postForm.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Date & Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={postForm.control}
                name="hashtags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hashtags (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="marketing, socialmedia, business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewPostDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPostMutation.isPending}
                >
                  Schedule Post
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Content Template</DialogTitle>
            <DialogDescription>
              Save reusable content templates for faster posting
            </DialogDescription>
          </DialogHeader>
          <Form {...templateForm}>
            <form onSubmit={templateForm.handleSubmit((data) => createTemplateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={templateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Template name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Template</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Template content with {variables}..." 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowTemplateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTemplateMutation.isPending}
                >
                  Create Template
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}