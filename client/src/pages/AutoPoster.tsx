import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, RefreshCw, Eye, Hash, Target, Image, Calendar } from "lucide-react";
import type { FacebookPage } from "@shared/schema";

interface GeneratedPost {
  content: string;
  hashtags: string[];
  callToAction: string;
  suggestedImages: string[];
  seoScore: number;
  bestPostTime: string;
  estimatedReach: string;
}

interface PostAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  readabilityScore: number;
  engagementPrediction: string;
  improvementSuggestions: string[];
}

export default function AutoPoster() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [postType, setPostType] = useState("promotional");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [customContent, setCustomContent] = useState("");
  const { toast } = useToast();

  const { data: facebookPages = [] } = useQuery<FacebookPage[]>({
    queryKey: ["/api/facebook/pages"],
  });

  const generatePostMutation = useMutation({
    mutationFn: async (data: {
      topic: string;
      audience: string;
      postType: string;
    }): Promise<GeneratedPost> => {
      const response = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to generate post");
      return response.json();
    },
    onSuccess: (data: GeneratedPost) => {
      setGeneratedPost(data);
      setCustomContent(data.content);
      toast({
        title: "Post Generated",
        description: "AI has created optimized content for your Facebook post.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate post content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const analyzePostMutation = useMutation({
    mutationFn: async (content: string): Promise<PostAnalysis> => {
      const response = await fetch("/api/ai/analyze-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to analyze post");
      return response.json();
    },
    onSuccess: (data: PostAnalysis) => {
      toast({
        title: "Analysis Complete",
        description: `Post analysis: ${data.sentiment} sentiment, ${data.readabilityScore}% readability`,
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (data: {
      pageId: string;
      content: string;
      scheduledTime?: string;
    }) => {
      const response = await fetch("/api/facebook/publish-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to publish post");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Published",
        description: "Your post has been successfully published to Facebook.",
      });
      setGeneratedPost(null);
      setCustomContent("");
      setTopic("");
    },
    onError: () => {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish post. Please check your Facebook connection.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic or theme for your post.",
        variant: "destructive",
      });
      return;
    }
    generatePostMutation.mutate({ topic, audience, postType });
  };

  const handleAnalyze = () => {
    if (!customContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to analyze.",
        variant: "destructive",
      });
      return;
    }
    analyzePostMutation.mutate(customContent);
  };

  const handlePublish = (pageId: string) => {
    if (!customContent.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to publish.",
        variant: "destructive",
      });
      return;
    }
    publishPostMutation.mutate({ pageId, content: customContent });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Auto Poster</h1>
        <p className="text-muted-foreground">
          Generate optimized Facebook posts with AI-powered content and SEO analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Content Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Content Generator
            </CardTitle>
            <CardDescription>
              Enter your topic and let AI create optimized content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Theme</Label>
              <Input
                id="topic"
                placeholder="e.g., New product launch, Holiday sale, Company update"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Young professionals, Parents, Tech enthusiasts"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postType">Post Type</Label>
              <select
                id="postType"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
              >
                <option value="promotional">Promotional</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="inspirational">Inspirational</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generatePostMutation.isPending}
              className="w-full"
            >
              {generatePostMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Generate Content
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Preview
            </CardTitle>
            <CardDescription>
              Review and edit your generated content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                placeholder="Generated content will appear here..."
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={6}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzePostMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {analyzePostMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Analyze SEO & Engagement
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Generated Suggestions */}
      {generatedPost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              AI Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Recommended Hashtags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {generatedPost.hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Call to Action</Label>
                <p className="text-sm text-muted-foreground mt-2">
                  {generatedPost.callToAction}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Suggested Images</Label>
                <div className="space-y-1 mt-2">
                  {generatedPost.suggestedImages.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Image className="h-4 w-4" />
                      {image}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Optimization Metrics</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>SEO Score:</span>
                    <Badge variant={generatedPost.seoScore > 80 ? "default" : "secondary"}>
                      {generatedPost.seoScore}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Est. Reach:</span>
                    <span className="text-muted-foreground">{generatedPost.estimatedReach}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Best time: {generatedPost.bestPostTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analyzePostMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle>Content Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {analyzePostMutation.data.sentiment.charAt(0).toUpperCase() + 
                   analyzePostMutation.data.sentiment.slice(1)}
                </div>
                <div className="text-sm text-muted-foreground">Sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analyzePostMutation.data.readabilityScore}%</div>
                <div className="text-sm text-muted-foreground">Readability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analyzePostMutation.data.engagementPrediction}</div>
                <div className="text-sm text-muted-foreground">Est. Engagement</div>
              </div>
            </div>

            {analyzePostMutation.data.improvementSuggestions.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Improvement Suggestions</Label>
                  <ul className="mt-2 space-y-1">
                    {analyzePostMutation.data.improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Publish to Facebook Pages */}
      {facebookPages.length > 0 && customContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Publish to Facebook
            </CardTitle>
            <CardDescription>
              Choose a Facebook page to publish your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facebookPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{page.pageName}</div>
                    <div className="text-sm text-muted-foreground">
                      {page.category} • {page.followerCount} followers
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePublish(page.id)}
                    disabled={publishPostMutation.isPending}
                    size="sm"
                  >
                    {publishPostMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Publish
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {facebookPages.length === 0 && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">
              No Facebook pages connected. Please connect your Facebook account in the dashboard to publish posts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}