import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, Eye, Clock, Target } from 'lucide-react';

interface ContentSuggestion {
  id: string;
  type: 'text' | 'image' | 'carousel' | 'link';
  content: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  carouselCards?: Array<{
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
  }>;
  confidence: number;
  performancePrediction: {
    expectedEngagement: number;
    expectedReach: number;
    expectedClicks: number;
  };
  reasoning: string;
  tags: string[];
}

interface CreativeFatigueAnalysis {
  fatigueLevel: 'low' | 'medium' | 'high' | 'critical';
  fatigueScore: number;
  recommendations: string[];
  suggestedRefresh: boolean;
  timeToRefresh: number;
}

export default function AIContentOptimizer() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  const [businessContext, setBusinessContext] = useState({
    industry: '',
    targetAudience: '',
    objectives: [] as string[],
    currentCampaigns: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch creative fatigue analysis
  const { data: fatigueAnalysis, isLoading: fatigueLoading } = useQuery({
    queryKey: ['/api/ai-content/fatigue-analysis'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch optimizer integration data
  const { data: optimizerData, isLoading: optimizerLoading } = useQuery({
    queryKey: ['/api/ai-content/optimizer-integration'],
    refetchInterval: 600000 // Refresh every 10 minutes
  });

  // Generate content suggestion mutation
  const generateSuggestionMutation = useMutation({
    mutationFn: async (context: any) => {
      return await apiRequest('/api/ai-content/generate-suggestion', {
        method: 'POST',
        body: JSON.stringify({ businessContext: context })
      });
    },
    onSuccess: (data) => {
      setSelectedSuggestion(data);
      toast({
        title: "Content Generated",
        description: `AI has generated a ${data.type} post with ${Math.round(data.confidence * 100)}% confidence`
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content suggestion",
        variant: "destructive"
      });
    }
  });

  // Auto-publish mutation
  const autoPublishMutation = useMutation({
    mutationFn: async ({ suggestion, forcePublish }: { suggestion: ContentSuggestion; forcePublish: boolean }) => {
      return await apiRequest('/api/ai-content/auto-publish', {
        method: 'POST',
        body: JSON.stringify({ suggestion, forcePublish })
      });
    },
    onSuccess: (data) => {
      if (data.published) {
        toast({
          title: "Content Published",
          description: `Post published successfully: ${data.postId}`
        });
        queryClient.invalidateQueries({ queryKey: ['/api/facebook/posts'] });
      } else {
        toast({
          title: "Publishing Skipped",
          description: data.reason,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Publishing Failed",
        description: "Failed to publish content",
        variant: "destructive"
      });
    }
  });

  const getFatigueColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">AI Content Optimizer</h2>
        <Badge variant="secondary">Powered by AI</Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creative Fatigue Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Creative Fatigue Analysis</span>
                </CardTitle>
                <CardDescription>
                  AI analysis of your content patterns and audience engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fatigueLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : fatigueAnalysis ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fatigue Level:</span>
                      <Badge className={getFatigueColor(fatigueAnalysis.fatigueLevel)}>
                        {fatigueAnalysis.fatigueLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score:</span>
                      <span className="text-sm">{Math.round(fatigueAnalysis.fatigueScore * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Refresh Needed:</span>
                      <span className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {fatigueAnalysis.timeToRefresh}h
                      </span>
                    </div>
                    {fatigueAnalysis.recommendations.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium">Recommendations:</span>
                        <ul className="mt-1 space-y-1">
                          {fatigueAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="text-xs text-gray-600">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No data available</div>
                )}
              </CardContent>
            </Card>

            {/* AI Optimizer Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>AI Optimizer Status</span>
                </CardTitle>
                <CardDescription>
                  Integration with advanced ad optimizer for automated content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {optimizerLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : optimizerData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-Generation:</span>
                      <Badge variant={optimizerData.shouldGenerateContent ? "default" : "secondary"}>
                        {optimizerData.shouldGenerateContent ? "Active" : "Standby"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Suggestions Ready:</span>
                      <span className="text-sm">{optimizerData.contentSuggestions?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-Publish:</span>
                      <Badge variant={optimizerData.autoPublishRecommendation ? "default" : "secondary"}>
                        {optimizerData.autoPublishRecommendation ? "Recommended" : "Manual"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Generate content based on current performance and fatigue analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => generateSuggestionMutation.mutate(businessContext)}
                  disabled={generateSuggestionMutation.isPending}
                  className="flex-1"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Content
                </Button>
                {optimizerData?.shouldGenerateContent && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const suggestion = optimizerData.contentSuggestions?.[0];
                      if (suggestion) {
                        autoPublishMutation.mutate({ suggestion, forcePublish: true });
                      }
                    }}
                    disabled={autoPublishMutation.isPending}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-Publish Best
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Content Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Context</CardTitle>
              <CardDescription>
                Provide context to help AI generate more relevant content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., E-commerce, SaaS, Healthcare"
                  value={businessContext.industry}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Small business owners, Tech enthusiasts"
                  value={businessContext.targetAudience}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, targetAudience: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="objectives">Primary Objectives</Label>
                <Select onValueChange={(value) => {
                  if (!businessContext.objectives.includes(value)) {
                    setBusinessContext(prev => ({ 
                      ...prev, 
                      objectives: [...prev.objectives, value] 
                    }));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select objectives" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement">Increase Engagement</SelectItem>
                    <SelectItem value="reach">Expand Reach</SelectItem>
                    <SelectItem value="conversions">Drive Conversions</SelectItem>
                    <SelectItem value="traffic">Generate Traffic</SelectItem>
                    <SelectItem value="brand_awareness">Build Brand Awareness</SelectItem>
                  </SelectContent>
                </Select>
                {businessContext.objectives.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {businessContext.objectives.map((obj, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          setBusinessContext(prev => ({
                            ...prev,
                            objectives: prev.objectives.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        {obj} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                onClick={() => generateSuggestionMutation.mutate(businessContext)}
                disabled={generateSuggestionMutation.isPending}
                className="w-full"
              >
                {generateSuggestionMutation.isPending ? "Generating..." : "Generate Content Suggestion"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          {selectedSuggestion ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI Generated Content</span>
                  <Badge className={getConfidenceColor(selectedSuggestion.confidence)}>
                    {Math.round(selectedSuggestion.confidence * 100)}% Confidence
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Type: {selectedSuggestion.type.toUpperCase()} • Generated by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Content</Label>
                  <Textarea 
                    value={selectedSuggestion.content}
                    onChange={(e) => setSelectedSuggestion(prev => prev ? { ...prev, content: e.target.value } : null)}
                    rows={4}
                  />
                </div>

                {selectedSuggestion.type === 'link' && (
                  <>
                    {selectedSuggestion.title && (
                      <div>
                        <Label>Title</Label>
                        <Input value={selectedSuggestion.title} readOnly />
                      </div>
                    )}
                    {selectedSuggestion.linkUrl && (
                      <div>
                        <Label>Link URL</Label>
                        <Input value={selectedSuggestion.linkUrl} readOnly />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <Label>AI Reasoning</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedSuggestion.reasoning}
                  </p>
                </div>

                <div>
                  <Label>Performance Prediction</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {selectedSuggestion.performancePrediction.expectedEngagement}
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {selectedSuggestion.performancePrediction.expectedReach}
                      </div>
                      <div className="text-xs text-gray-500">Reach</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {selectedSuggestion.performancePrediction.expectedClicks}
                      </div>
                      <div className="text-xs text-gray-500">Clicks</div>
                    </div>
                  </div>
                </div>

                {selectedSuggestion.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSuggestion.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => autoPublishMutation.mutate({ suggestion: selectedSuggestion, forcePublish: false })}
                    disabled={autoPublishMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Smart Publish
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => autoPublishMutation.mutate({ suggestion: selectedSuggestion, forcePublish: true })}
                    disabled={autoPublishMutation.isPending}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Force Publish
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => generateSuggestionMutation.mutate(businessContext)}
                    disabled={generateSuggestionMutation.isPending}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Suggestions Yet</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  Generate AI-powered content suggestions based on your performance data and creative fatigue analysis
                </p>
                <Button onClick={() => generateSuggestionMutation.mutate(businessContext)}>
                  Generate First Suggestion
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Show optimizer suggestions if available */}
          {optimizerData?.contentSuggestions && optimizerData.contentSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optimizer Suggestions</CardTitle>
                <CardDescription>
                  Content suggestions from your ad performance optimizer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizerData.contentSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <div 
                      key={idx}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <Badge className={getConfidenceColor(suggestion.confidence)}>
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {suggestion.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Automation Settings</CardTitle>
              <CardDescription>
                Configure how the AI content optimizer works with your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-Generate Content</Label>
                  <p className="text-xs text-gray-500">Automatically generate content when fatigue is detected</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-Publish Threshold</Label>
                  <p className="text-xs text-gray-500">Minimum confidence score for automatic publishing</p>
                </div>
                <Badge variant="secondary">85%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Content Review</Label>
                  <p className="text-xs text-gray-500">Require manual review before publishing</p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}