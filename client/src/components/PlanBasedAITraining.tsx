import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Zap, 
  Crown, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Sparkles,
  Database,
  MessageSquare,
  Lightbulb
} from "lucide-react";

export const PlanBasedAITraining: React.FC = () => {
  const [contentTopic, setContentTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI training analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/ai/training-analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content Generated",
        description: `Using ${data.strategy} strategy for ${data.plan} tier`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
    },
  });

  const handleGenerateContent = async () => {
    if (!contentTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a content topic",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateContentMutation.mutateAsync(contentTopic);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise': return <Crown className="h-5 w-5 text-purple-500" />;
      case 'pro': return <Zap className="h-5 w-5 text-blue-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Sparkles className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold">Plan-Based AI Training</h1>
          <p className="text-muted-foreground">
            AI intelligence that adapts to your subscription tier
          </p>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="generator">AI Generator</TabsTrigger>
            <TabsTrigger value="analytics">Training Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                  {getPlanIcon(analytics?.plan)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{analytics?.plan || 'Free'}</div>
                  <Badge className={`mt-2 ${getPlanColor(analytics?.plan)}`}>
                    {analytics?.aiStrategy}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalPosts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Content in your history
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Performers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.highPerformingPosts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Posts with score ≥ 7.0
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>AI Capabilities by Plan</span>
                </CardTitle>
                <CardDescription>
                  See what AI features are available for each tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.capabilities?.map((capability: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Content Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate content using your plan's AI intelligence level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Content Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., summer product launch, customer testimonials, industry insights"
                    value={contentTopic}
                    onChange={(e) => setContentTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateContent()}
                  />
                </div>

                <Button
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !contentTopic.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Content
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <Card className="mt-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Generated Content</CardTitle>
                        <Badge className={getPlanColor(generatedContent.plan)}>
                          {generatedContent.strategy}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">{generatedContent.content}</p>
                      </div>
                      {generatedContent.trainingExamples > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Based on {generatedContent.trainingExamples} high-performing examples
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics?.plan === 'enterprise' && analytics?.trainingMetrics ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Average Performance Score</span>
                          <span>{analytics.trainingMetrics.avgPerformanceScore.toFixed(1)}</span>
                        </div>
                        <Progress 
                          value={analytics.trainingMetrics.avgPerformanceScore * 10} 
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Training Data Status</h4>
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            {analytics.trainingDataAvailable ? 'Ready for fine-tuning' : 'Collecting data'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {analytics.trainingMetrics.bestPost && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Best Performing Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {analytics.trainingMetrics.bestPost.message}
                        </p>
                        <div className="mt-2 text-xs text-green-600">
                          Score: {analytics.trainingMetrics.bestPost.performanceScore}/10
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Training Analytics</CardTitle>
                  <CardDescription>
                    Advanced analytics are available for Enterprise tier users
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enterprise Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Enterprise for detailed AI training analytics and performance-based fine-tuning
                  </p>
                  <Button variant="outline">
                    Learn About Enterprise
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PlanBasedAITraining;