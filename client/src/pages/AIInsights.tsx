import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  CheckCircle,
  Globe,
  MessageSquare,
  BarChart3,
  Sparkles,
  Languages,
  Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { apiRequest } from "@/lib/queryClient";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AIInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [contentType, setContentType] = useState("post");
  const [targetAudience, setTargetAudience] = useState("");
  const [translateContent, setTranslateContent] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [performancePrediction, setPerformancePrediction] = useState("");

  // AI Insights Query
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/ai/insights", selectedTimeframe],
  });

  // Market Trends Query
  const { data: marketTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/ai/market-trends"],
  });

  // Sentiment Analysis Query
  const { data: sentimentData, isLoading: sentimentLoading } = useQuery({
    queryKey: ["/api/ai/sentiment-analysis", selectedTimeframe],
  });

  // Content Suggestions Mutation
  const contentSuggestionsMutation = useMutation({
    mutationFn: async (data: { contentType: string; targetAudience: string }) => {
      return await apiRequest("/api/ai/content-suggestions", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  });

  // Translation Mutation
  const translationMutation = useMutation({
    mutationFn: async (data: { content: string; targetLanguages: string[]; culturalAdaptation: boolean }) => {
      return await apiRequest("/api/ai/translate", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  });

  // Performance Prediction Mutation
  const performancePredictionMutation = useMutation({
    mutationFn: async (contentData: any) => {
      return await apiRequest("/api/ai/predict-performance", {
        method: "POST",
        body: JSON.stringify(contentData)
      });
    }
  });

  const handleGenerateContentSuggestions = () => {
    contentSuggestionsMutation.mutate({ contentType, targetAudience });
  };

  const handleTranslateContent = () => {
    if (translateContent && selectedLanguages.length > 0) {
      translationMutation.mutate({
        content: translateContent,
        targetLanguages: selectedLanguages,
        culturalAdaptation: true
      });
    }
  };

  const handlePredictPerformance = () => {
    if (performancePrediction) {
      performancePredictionMutation.mutate({
        content: performancePrediction,
        type: contentType,
        targetAudience
      });
    }
  };

  if (insightsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced AI Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analytics, content generation, and multi-language support
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="content">Content AI</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="translate">Multi-Language</TabsTrigger>
          <TabsTrigger value="predict">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(insights) ? insights.map((insight: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{insight.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {insight.actionableSteps?.map((step: string, stepIndex: number) => (
                          <li key={stepIndex} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Expected Impact:</span>
                        <span className="font-medium text-green-600">{insight.expectedImpact}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : null}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>AI Content Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate engaging content suggestions powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals, Tech enthusiasts"
                  />
                </div>

                <Button 
                  onClick={handleGenerateContentSuggestions}
                  disabled={contentSuggestionsMutation.isPending}
                  className="w-full"
                >
                  {contentSuggestionsMutation.isPending ? "Generating..." : "Generate Suggestions"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {contentSuggestionsMutation.data ? (
                  <div className="space-y-4">
                    {contentSuggestionsMutation.data.map((suggestion: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{suggestion.type}</Badge>
                          <span className="text-sm text-gray-500">
                            Score: {suggestion.engagementScore}/100
                          </span>
                        </div>
                        <p className="text-sm mb-2">{suggestion.content}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {suggestion.hashtags?.map((tag: string, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          <div>Target: {suggestion.targetAudience}</div>
                          <div>Best time: {suggestion.optimalTiming}</div>
                          <div>Est. reach: {suggestion.estimatedReach?.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Generate content suggestions to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Sentiment Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentData ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">
                        {(sentimentData as any)?.overall > 0 ? '+' : ''}{((sentimentData as any)?.overall * 100).toFixed(1)}%
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-500">Overall Sentiment</span>
                        <Badge variant={(sentimentData as any)?.trend === 'improving' ? 'default' : 'secondary'}>
                          {(sentimentData as any)?.trend}
                        </Badge>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: (sentimentData as any)?.breakdown?.positive || 45, color: '#00C49F' },
                            { name: 'Neutral', value: (sentimentData as any)?.breakdown?.neutral || 35, color: '#FFBB28' },
                            { name: 'Negative', value: (sentimentData as any)?.breakdown?.negative || 20, color: '#FF8042' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {[0, 1, 2].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Loading sentiment data...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(sentimentData as any)?.insights?.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Array.isArray(marketTrends) ? marketTrends : [])?.map((trend: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.trend}</CardTitle>
                    <Badge variant={trend.momentum === 'rising' ? 'default' : 'secondary'}>
                      {trend.momentum}
                    </Badge>
                  </div>
                  <CardDescription>
                    Relevance Score: {trend.relevanceScore}/100
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Opportunities:</h4>
                      <ul className="space-y-1">
                        {Array.isArray(trend.opportunities) ? trend.opportunities.map((opportunity: string, oppIndex: number) => (
                          <li key={oppIndex} className="flex items-start space-x-2 text-sm">
                            <TrendingUp className="h-3 w-3 text-green-500 mt-1" />
                            <span>{opportunity}</span>
                          </li>
                        )) : []}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {Array.isArray(trend.recommendedActions) ? trend.recommendedActions.map((action: string, actionIndex: number) => (
                          <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                            <Target className="h-3 w-3 text-blue-500 mt-1" />
                            <span>{action}</span>
                          </li>
                        )) : []}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </TabsContent>

        <TabsContent value="translate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Languages className="h-5 w-5" />
                  <span>Multi-Language Content</span>
                </CardTitle>
                <CardDescription>
                  Translate and culturally adapt your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="translateContent">Content to Translate</Label>
                  <Textarea
                    id="translateContent"
                    value={translateContent}
                    onChange={(e) => setTranslateContent(e.target.value)}
                    placeholder="Enter your content here..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label>Target Languages</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese'].map((lang) => (
                      <label key={lang} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLanguages([...selectedLanguages, lang]);
                            } else {
                              setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                            }
                          }}
                        />
                        <span className="text-sm">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleTranslateContent}
                  disabled={translationMutation.isPending || !translateContent || selectedLanguages.length === 0}
                  className="w-full"
                >
                  {translationMutation.isPending ? "Translating..." : "Translate Content"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Translations</CardTitle>
              </CardHeader>
              <CardContent>
                {translationMutation.data ? (
                  <div className="space-y-4">
                    {Object.entries(translationMutation.data).map(([language, translation]) => (
                      <div key={language} className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="h-4 w-4" />
                          <span className="font-semibold">{language}</span>
                        </div>
                        <p className="text-sm">{translation as string}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Translate content to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predict" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance Predictor</span>
                </CardTitle>
                <CardDescription>
                  Predict how your content will perform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="performancePrediction">Content Preview</Label>
                  <Textarea
                    id="performancePrediction"
                    value={performancePrediction}
                    onChange={(e) => setPerformancePrediction(e.target.value)}
                    placeholder="Enter content to predict performance..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handlePredictPerformance}
                  disabled={performancePredictionMutation.isPending || !performancePrediction}
                  className="w-full"
                >
                  {performancePredictionMutation.isPending ? "Analyzing..." : "Predict Performance"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                {performancePredictionMutation.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {performancePredictionMutation.data.reach?.expected?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Expected Reach</div>
                        <div className="text-xs text-gray-400">
                          {performancePredictionMutation.data.reach?.min?.toLocaleString()} - {performancePredictionMutation.data.reach?.max?.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {performancePredictionMutation.data.engagement?.expected?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Expected Engagement</div>
                        <div className="text-xs text-gray-400">
                          {performancePredictionMutation.data.engagement?.min?.toLocaleString()} - {performancePredictionMutation.data.engagement?.max?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Confidence Level</span>
                        <span className="text-lg font-bold">{performancePredictionMutation.data.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${performancePredictionMutation.data.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Key Factors:</h4>
                      <ul className="space-y-1">
                        {performancePredictionMutation.data.factors?.map((factor: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <BarChart3 className="h-3 w-3 text-purple-500 mt-1" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Enter content to predict performance
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {(!insights || (Array.isArray(insights) && insights.length === 0)) && !insightsLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Building AI insights...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI insights will appear here once sufficient data is analyzed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}