import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Wand2,
  Send,
  Eye,
  Loader2,
  Target,
  Calendar,
  Brain,
  Sparkles,
  Copy,
  Palette,
  Image,
  Download,
  FileText,
  Edit,
} from "lucide-react";

interface GeneratedPost {
  content: string;
  hashtags: string[];
  callToAction: string;
  suggestedImages: string[];
  seoScore: number;
  bestPostTime: string;
  estimatedReach: string;
  provider?: string;
  confidence?: number;
}

interface PostAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  readabilityScore: number;
  engagementPrediction: string;
  improvementSuggestions: string[];
}

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
  dimensions: string;
}

interface PostTemplate {
  id: string;
  name: string;
  category: string;
  structure: string;
  variables: string[];
  description: string;
}

export default function AutoPoster() {
  const { toast } = useToast();
  
  // States for AI Content Generation
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [postType, setPostType] = useState("promotional");
  const [contentTone, setContentTone] = useState("professional");
  const [brandVoice, setBrandVoice] = useState("");
  const [useHybridAI, setUseHybridAI] = useState(true);
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  
  // States for Image Generation
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  
  // States for Templates
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateVariables, setTemplateVariables] = useState<{[key: string]: string}>({});
  
  // State for Publishing
  const [customContent, setCustomContent] = useState("");

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Fetch connected pages
  const pagesQuery = useQuery({
    queryKey: ["/api/facebook/pages"],
  });

  // Generate content mutation
  const generatePostMutation = useMutation({
    mutationFn: async (data: {
      topic: string;
      audience: string;
      postType: string;
      tone: string;
      brandVoice: string;
      useHybridAI: boolean;
    }) => {
      const endpoint = data.useHybridAI ? "/api/hybrid-ai/generate-content" : "/api/ai/generate-post";
      const response = await fetch(endpoint, {
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

  // Generate image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (data: { prompt: string; style: string; dimensions: string }) => {
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to generate image");
      return response.json();
    },
  });

  // Generate from template mutation
  const generateFromTemplateMutation = useMutation({
    mutationFn: async (data: { templateId: string; variables: {[key: string]: string} }) => {
      const response = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to generate from template");
      return response.json();
    },
  });

  // Handler functions
  const handleGeneratePost = () => {
    generatePostMutation.mutate({
      topic,
      audience,
      postType,
      tone: contentTone,
      brandVoice,
      useHybridAI
    });
  };

  const handleGenerateImage = () => {
    if (!imagePrompt) {
      toast({
        title: "Error",
        description: "Please enter an image prompt",
        variant: "destructive"
      });
      return;
    }

    generateImageMutation.mutate({
      prompt: imagePrompt,
      style: imageStyle,
      dimensions: "1024x1024"
    }, {
      onSuccess: (data) => {
        setGeneratedImages(prev => [...prev, data]);
        toast({
          title: "Success",
          description: "Image generated successfully!"
        });
      }
    });
  };

  const handleGenerateFromTemplate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive"
      });
      return;
    }

    const template = (templates as PostTemplate[]).find((t: PostTemplate) => t.id === selectedTemplate);
    if (!template) return;

    // Check if all required variables are filled
    const missingVars = template.variables.filter((variable: string) => !templateVariables[variable]);
    if (missingVars.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in: ${missingVars.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    generateFromTemplateMutation.mutate({
      templateId: selectedTemplate,
      variables: templateVariables
    }, {
      onSuccess: (data) => {
        setGeneratedPost(data);
        toast({
          title: "Success",
          description: "Post generated from template!"
        });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const analyzePostMutation = useMutation({
    mutationFn: async (content: string): Promise<PostAnalysis> => {
      const response = await fetch("/api/hybrid-ai/analyze-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to analyze post");
      const result = await response.json();
      return {
        sentiment: result.analysis.sentiment,
        readabilityScore: result.analysis.readabilityScore,
        engagementPrediction: result.analysis.engagementPrediction,
        improvementSuggestions: result.recommendations
      };
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
      const response = await fetch("/api/facebook/publish", {
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
    },
    onError: () => {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enhanced Auto Poster</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered content generation with Claude + OpenAI, image creation, and smart templates.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-500">Hybrid AI Active</span>
        </div>
      </div>

      <Tabs defaultValue="ai-generation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-generation">AI Content Generator</TabsTrigger>
          <TabsTrigger value="image-creator">Image Creator</TabsTrigger>
          <TabsTrigger value="templates">Smart Templates</TabsTrigger>
          <TabsTrigger value="publish">Publish & Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-generation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-5 w-5" />
                  <span>AI Content Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate high-quality posts using Claude + OpenAI hybrid processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="hybridAI">Use Hybrid AI</Label>
                  <Switch
                    id="hybridAI"
                    checked={useHybridAI}
                    onCheckedChange={setUseHybridAI}
                  />
                </div>
                
                <div>
                  <Label htmlFor="topic">Topic or Theme</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., New product launch, industry insights, company news"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g., Tech professionals"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postType">Post Type</Label>
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="behind-the-scenes">Behind the Scenes</SelectItem>
                        <SelectItem value="user-generated">User Generated</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone">Content Tone</Label>
                    <Select value={contentTone} onValueChange={setContentTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="exciting">Exciting</SelectItem>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="brandVoice">Brand Voice (Optional)</Label>
                    <Input
                      id="brandVoice"
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      placeholder="Your brand personality"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGeneratePost}
                  disabled={generatePostMutation.isPending || !topic || !audience}
                  className="w-full"
                >
                  {generatePostMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {generatePostMutation.isPending ? "Generating..." : "Generate AI Content"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPost ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {generatedPost.provider && (
                            <Badge variant="outline">{generatedPost.provider}</Badge>
                          )}
                          {generatedPost.confidence && (
                            <span className="text-sm text-gray-500">
                              Confidence: {Math.round(generatedPost.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generatedPost.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-4">{generatedPost.content}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>SEO Score: {generatedPost.seoScore}/100</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span>Best Time: {generatedPost.bestPostTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => analyzePostMutation.mutate(generatedPost.content)}
                        disabled={analyzePostMutation.isPending}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Analyze Content
                      </Button>
                      <Button
                        onClick={() => setCustomContent(generatedPost.content)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Use This Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    Generate AI content to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="image-creator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>AI Image Generator</span>
                </CardTitle>
                <CardDescription>
                  Create custom images for your posts using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="imagePrompt">Image Description</Label>
                  <Textarea
                    id="imagePrompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="imageStyle">Art Style</Label>
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateImage}
                  disabled={generateImageMutation.isPending || !imagePrompt}
                  className="w-full"
                >
                  {generateImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4 mr-2" />
                  )}
                  {generateImageMutation.isPending ? "Creating Image..." : "Generate Image"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Images</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-square bg-gray-100 rounded-lg border overflow-hidden">
                          <img 
                            src={image.url} 
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          <p className="truncate">{image.prompt}</p>
                          <p>Style: {image.style}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    Generate images to see them here
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Smart Templates</span>
                </CardTitle>
                <CardDescription>
                  Use proven post templates with customizable variables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template">Choose Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {(templates as PostTemplate[]).map((template: PostTemplate) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedTemplate && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {(templates as PostTemplate[]).find((t: PostTemplate) => t.id === selectedTemplate)?.description}
                      </p>
                    </div>
                    
                    {(templates as PostTemplate[]).find((t: PostTemplate) => t.id === selectedTemplate)?.variables.map((variable: string) => (
                      <div key={variable}>
                        <Label htmlFor={variable} className="capitalize">
                          {variable.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Input
                          id={variable}
                          value={templateVariables[variable] || ''}
                          onChange={(e) => setTemplateVariables(prev => ({
                            ...prev,
                            [variable]: e.target.value
                          }))}
                          placeholder={`Enter ${variable.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleGenerateFromTemplate}
                  disabled={generateFromTemplateMutation.isPending || !selectedTemplate}
                  className="w-full"
                >
                  {generateFromTemplateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {generateFromTemplateMutation.isPending ? "Generating..." : "Generate from Template"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h4 className="font-semibold mb-2">Template Structure:</h4>
                      <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                        {(templates as PostTemplate[]).find((t: PostTemplate) => t.id === selectedTemplate)?.structure}
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Preview with Your Content:</h4>
                      <p className="text-sm whitespace-pre-wrap">
                        {(templates as PostTemplate[]).find((t: PostTemplate) => t.id === selectedTemplate)?.structure
                          ?.replace(/{(\w+)}/g, (match: string, variable: string) => 
                            templateVariables[variable] || `{${variable}}`
                          )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    Select a template to see preview
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Final Content Editor
                </CardTitle>
                <CardDescription>
                  Review and edit your content before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customContent">Post Content</Label>
                  <Textarea
                    id="customContent"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Write or edit your Facebook post content here..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAnalyze}
                    disabled={analyzePostMutation.isPending || !customContent.trim()}
                  >
                    {analyzePostMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    Analyze Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {pagesQuery.data && Array.isArray(pagesQuery.data) && pagesQuery.data.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Publish Post
                  </CardTitle>
                  <CardDescription>
                    Choose your Facebook page to publish the content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {pagesQuery.data.map((page: any) => (
                      <div
                        key={page.pageId}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h3 className="font-medium">{page.pageName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {page.followerCount?.toLocaleString() || 0} followers
                          </p>
                        </div>
                        <Button
                          onClick={() => handlePublish(page.pageId)}
                          disabled={publishPostMutation.isPending || !customContent.trim()}
                        >
                          {publishPostMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Pages Connected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No Facebook pages connected. Please connect your Facebook account in the dashboard to publish posts.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}