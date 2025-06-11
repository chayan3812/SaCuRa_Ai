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
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Zap, 
  MessageSquare,
  TrendingUp,
  Languages,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function HybridAI() {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("post");
  const [options, setOptions] = useState({
    brand: "",
    audience: "",
    tone: "professional",
    length: "medium"
  });
  
  const [customerMessage, setCustomerMessage] = useState("");
  const [customerContext, setCustomerContext] = useState("");
  const [customerTone, setCustomerTone] = useState("professional");
  
  const [analysisContent, setAnalysisContent] = useState("");
  const [adCopy, setAdCopy] = useState("");
  const [adObjective, setAdObjective] = useState("awareness");
  const [targetAudience, setTargetAudience] = useState("");

  // Provider Health Query
  const { data: providerHealth, refetch: refetchHealth } = useQuery({
    queryKey: ["/api/hybrid-ai/provider-health"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Content Generation Mutation
  const contentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/hybrid-ai/generate-content", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  });

  // Customer Response Mutation
  const customerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/hybrid-ai/customer-response", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  });

  // Content Analysis Mutation
  const analysisMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/hybrid-ai/analyze-content", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  });

  // Ad Optimization Mutation
  const adMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/hybrid-ai/optimize-ad", {
        method: "POST",
        body: JSON.stringify(data)
      });
    }
  });

  const handleGenerateContent = () => {
    contentMutation.mutate({
      prompt,
      contentType,
      options
    });
  };

  const handleGenerateCustomerResponse = () => {
    customerMutation.mutate({
      message: customerMessage,
      context: customerContext,
      tone: customerTone
    });
  };

  const handleAnalyzeContent = () => {
    analysisMutation.mutate({
      content: analysisContent
    });
  };

  const handleOptimizeAd = () => {
    adMutation.mutate({
      adCopy,
      objective: adObjective,
      targetAudience
    });
  };

  const getProviderStatusColor = (provider: any) => {
    if (!provider?.available) return "bg-red-500";
    if (provider.errorRate > 0.1) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProviderStatusText = (provider: any) => {
    if (!provider?.available) return "Offline";
    if (provider.errorRate > 0.1) return "Issues";
    return "Healthy";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hybrid AI Engine</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Claude + OpenAI powered content generation and optimization
          </p>
        </div>
        
        <Button onClick={() => refetchHealth()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Provider Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Provider Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerHealth && Object.entries(providerHealth).map(([name, provider]: [string, any]) => (
              <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getProviderStatusColor(provider)}`}></div>
                  <div>
                    <div className="font-semibold capitalize">{name}</div>
                    <div className="text-sm text-gray-500">
                      Response: {provider?.responseTime?.toFixed(0)}ms | Error: {(provider?.errorRate * 100)?.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <Badge variant={provider?.available ? "default" : "destructive"}>
                  {getProviderStatusText(provider)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content Generation</TabsTrigger>
          <TabsTrigger value="customer">Customer Service</TabsTrigger>
          <TabsTrigger value="analysis">Content Analysis</TabsTrigger>
          <TabsTrigger value="ads">Ad Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Enhanced Content Generator</span>
                </CardTitle>
                <CardDescription>
                  Generate high-quality content using Claude + OpenAI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Content Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the content you want to generate..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Social Post</SelectItem>
                        <SelectItem value="ad">Advertisement</SelectItem>
                        <SelectItem value="story">Story Content</SelectItem>
                        <SelectItem value="response">Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={options.tone} onValueChange={(value) => setOptions({...options, tone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="exciting">Exciting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand (Optional)</Label>
                    <Input
                      id="brand"
                      value={options.brand}
                      onChange={(e) => setOptions({...options, brand: e.target.value})}
                      placeholder="Your brand name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Input
                      id="audience"
                      value={options.audience}
                      onChange={(e) => setOptions({...options, audience: e.target.value})}
                      placeholder="e.g., Young professionals"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateContent}
                  disabled={contentMutation.isPending || !prompt}
                  className="w-full"
                >
                  {contentMutation.isPending ? "Generating..." : "Generate Content"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent>
                {contentMutation.data ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{contentMutation.data.provider}</Badge>
                        <span className="text-sm text-gray-500">
                          Confidence: {Math.round(contentMutation.data.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{contentMutation.data.content}</p>
                    </div>
                    
                    {contentMutation.data.alternatives && contentMutation.data.alternatives.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Alternative Versions:</h4>
                        {contentMutation.data.alternatives.map((alt: string, index: number) => (
                          <div key={index} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm">{alt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Generate content to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Customer Service AI</span>
                </CardTitle>
                <CardDescription>
                  Generate professional customer responses with dual AI validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerMessage">Customer Message</Label>
                  <Textarea
                    id="customerMessage"
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    placeholder="Enter the customer's message or inquiry..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerContext">Context (Optional)</Label>
                  <Input
                    id="customerContext"
                    value={customerContext}
                    onChange={(e) => setCustomerContext(e.target.value)}
                    placeholder="Previous conversation context, order info, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerTone">Response Tone</Label>
                  <Select value={customerTone} onValueChange={setCustomerTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="helpful">Helpful</SelectItem>
                      <SelectItem value="apologetic">Apologetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateCustomerResponse}
                  disabled={customerMutation.isPending || !customerMessage}
                  className="w-full"
                >
                  {customerMutation.isPending ? "Generating Response..." : "Generate Response"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Response</CardTitle>
              </CardHeader>
              <CardContent>
                {customerMutation.data ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{customerMutation.data.provider}</Badge>
                          <Badge variant={customerMutation.data.urgency === 'high' ? 'destructive' : 'default'}>
                            {customerMutation.data.urgency} urgency
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          Confidence: {Math.round(customerMutation.data.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-3">{customerMutation.data.response}</p>
                      <div className="text-xs text-gray-600">
                        <strong>Detected Sentiment:</strong> {customerMutation.data.sentiment}
                      </div>
                    </div>
                    
                    {customerMutation.data.suggestedActions && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Suggested Actions:</h4>
                        <ul className="space-y-1">
                          {customerMutation.data.suggestedActions.map((action: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Generate a customer response to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Advanced Content Analysis</span>
                </CardTitle>
                <CardDescription>
                  Cross-validate content analysis with dual AI engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="analysisContent">Content to Analyze</Label>
                  <Textarea
                    id="analysisContent"
                    value={analysisContent}
                    onChange={(e) => setAnalysisContent(e.target.value)}
                    placeholder="Paste the content you want to analyze..."
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={handleAnalyzeContent}
                  disabled={analysisMutation.isPending || !analysisContent}
                  className="w-full"
                >
                  {analysisMutation.isPending ? "Analyzing..." : "Analyze Content"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisMutation.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisMutation.data.analysis.readabilityScore}/100
                        </div>
                        <div className="text-sm text-gray-500">Readability</div>
                      </div>
                      
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisMutation.data.analysis.engagementPrediction}/100
                        </div>
                        <div className="text-sm text-gray-500">Engagement</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sentiment:</span>
                        <Badge variant={analysisMutation.data.analysis.sentiment === 'positive' ? 'default' : 'secondary'}>
                          {analysisMutation.data.analysis.sentiment}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tone:</span>
                        <span className="text-sm">{analysisMutation.data.analysis.tone}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence:</span>
                        <span className="text-sm">{Math.round(analysisMutation.data.confidence * 100)}%</span>
                      </div>
                    </div>
                    
                    {analysisMutation.data.recommendations && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {analysisMutation.data.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <TrendingUp className="h-3 w-3 text-blue-500 mt-1" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Analyze content to see detailed insights
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Ad Campaign Optimizer</span>
                </CardTitle>
                <CardDescription>
                  Optimize ad copy with dual AI recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adCopy">Current Ad Copy</Label>
                  <Textarea
                    id="adCopy"
                    value={adCopy}
                    onChange={(e) => setAdCopy(e.target.value)}
                    placeholder="Enter your current ad copy..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adObjective">Campaign Objective</Label>
                    <Select value={adObjective} onValueChange={setAdObjective}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                        <SelectItem value="traffic">Website Traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Tech entrepreneurs"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleOptimizeAd}
                  disabled={adMutation.isPending || !adCopy}
                  className="w-full"
                >
                  {adMutation.isPending ? "Optimizing..." : "Optimize Ad Copy"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                {adMutation.data ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold mb-2">Optimized Copy:</h4>
                      <p className="text-sm whitespace-pre-wrap">{adMutation.data.optimizedCopy}</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Key Improvements:</h4>
                      <ul className="space-y-1">
                        {adMutation.data.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold mb-2">Expected Performance:</h4>
                      <p className="text-sm">{adMutation.data.expectedPerformance}</p>
                      <div className="mt-2 text-xs text-gray-600">
                        Confidence: {Math.round(adMutation.data.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Optimize ad copy to see recommendations
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}