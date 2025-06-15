import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Brain, 
  Settings,
  Copy,
  Play,
  BarChart3,
  DollarSign,
  Users,
  MessageSquare,
  Eye,
  MousePointer,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { apiRequest } from "@/lib/queryClient";

export default function AdOptimizer() {
  const [selectedCampaignId, setSelectedCampaignId] = useState("campaign_123");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAdvancedOptimizing, setIsAdvancedOptimizing] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoImproving, setIsAutoImproving] = useState(false);
  const [adCopy, setAdCopy] = useState<any>(null);
  const [advancedSuggestions, setAdvancedSuggestions] = useState<any[]>([]);
  const [competitorKeywords, setCompetitorKeywords] = useState<string[]>([]);

  const { toast } = useToast();

  // Load competitor keywords from localStorage
  useEffect(() => {
    const storedKeywords = localStorage.getItem('competitorKeywords');
    if (storedKeywords) {
      try {
        const keywordData = JSON.parse(storedKeywords);
        const isRecent = Date.now() - keywordData.timestamp < 24 * 60 * 60 * 1000; // 24 hours
        if (isRecent && keywordData.keywords) {
          setCompetitorKeywords(keywordData.keywords);
        }
      } catch (error) {
        console.error('Error loading competitor keywords:', error);
      }
    }
  }, []);

  // Fetch performance metrics
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/ads/performance-metrics'],
    refetchInterval: 30000,
  });

  // Fetch campaigns
  const { data: campaigns } = useQuery({
    queryKey: ['/api/facebook/campaigns'],
  });

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await apiRequest('/api/ads/optimize', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: selectedCampaignId
        })
      });
      
      const data = await response.json();
      setAdCopy(data);
      
      toast({
        title: "Optimization Complete",
        description: "AI has generated optimized ad copy for your campaign.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAdvancedOptimize = async () => {
    setIsAdvancedOptimizing(true);
    try {
      const response = await apiRequest('/api/ads/advanced-optimize', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: selectedCampaignId
        })
      });
      
      const data = await response.json();
      setAdvancedSuggestions(data);
      
      toast({
        title: "Advanced Optimization Complete",
        description: `Generated ${data.length} comprehensive optimization strategies.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate advanced optimizations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdvancedOptimizing(false);
    }
  };

  const handleAutoImplement = async (optimizationId: string) => {
    try {
      const response = await apiRequest('/api/ads/auto-implement', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          optimizationId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Auto-Implementation Successful",
          description: "Optimization has been automatically applied to your campaign.",
        });
        // Refresh advanced suggestions
        handleAdvancedOptimize();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to implement optimization automatically.",
        variant: "destructive",
      });
    }
  };

  const handleAutoFixPageIssues = async () => {
    setIsAutoFixing(true);
    try {
      const response = await apiRequest('/api/ads/auto-fix', {
        method: 'POST',
        body: JSON.stringify({
          pageId: 'demo_page_123'
        })
      });
      
      const data = await response.json();
      
      toast({
        title: "Auto-Fix Complete",
        description: data.message || "Page issues have been automatically resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-fix page issues. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoFixing(false);
    }
  };

  const handleAutoAnalyzePage = async () => {
    setIsAnalyzing(true);
    try {
      const response = await apiRequest('/api/page/auto-analyze', {
        method: 'POST',
        body: JSON.stringify({
          pageId: 'demo_page_123',
          includePerformanceMetrics: true,
          includeAudienceInsights: true,
          includeContentAnalysis: true
        })
      });
      
      const data = await response.json();
      
      toast({
        title: "Page Analysis Complete",
        description: "Comprehensive page analysis has been completed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoImprove = async () => {
    setIsAutoImproving(true);
    try {
      const response = await apiRequest('/api/ads/auto-improve', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          improvementAreas: ['targeting', 'creative', 'bidding']
        })
      });
      
      const data = await response.json();
      
      toast({
        title: "Auto-Improvement Complete",
        description: "Campaign has been automatically improved based on AI recommendations.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply auto-improvements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoImproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ad Optimizer</h1>
          <p className="text-muted-foreground">AI-powered Facebook ad optimization and performance enhancement</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Real-time
          </Badge>
        </div>
      </div>

      {/* Campaign Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Selection
          </CardTitle>
          <CardDescription>
            Select a campaign to optimize and enhance performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign">Select Campaign</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="campaign_123">Summer Sale Campaign</SelectItem>
                  <SelectItem value="campaign_456">Product Launch</SelectItem>
                  <SelectItem value="campaign_789">Brand Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button onClick={handleOptimize} disabled={isOptimizing} className="flex-1">
                  {isOptimizing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Quick Optimize
                </Button>
                <Button onClick={handleAdvancedOptimize} disabled={isAdvancedOptimizing} variant="outline" className="flex-1">
                  {isAdvancedOptimizing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                  Advanced
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Ad Copy */}
      {adCopy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI-Generated Ad Copy
            </CardTitle>
            <CardDescription>
              Optimized content generated by our advanced AI engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Primary Text</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{(adCopy as any)?.primaryText || 'Generated text will appear here'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Headline</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{(adCopy as any)?.headline || 'Generated headline will appear here'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Description</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{(adCopy as any)?.description || 'Generated description will appear here'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Call to Action</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{(adCopy as any)?.callToAction || 'Generated CTA will appear here'}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                      Performance Score: {(adCopy as any)?.performanceScore || 0}/100
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Est. CTR: {(adCopy as any)?.estimatedCTR || 0}%
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setAdCopy(null)} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  Generate New
                </Button>
                <Button 
                  onClick={() => {
                    const adCopyData = adCopy as any;
                    navigator.clipboard.writeText(`${adCopyData?.primaryText || ''}\n\nHeadline: ${adCopyData?.headline || ''}\nDescription: ${adCopyData?.description || ''}\nCTA: ${adCopyData?.callToAction || ''}`);
                    toast({
                      title: "Copied to clipboard",
                      description: "Ad copy has been copied to your clipboard.",
                    });
                  }}
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold text-foreground">$2,847</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold text-foreground">124K</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+8.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold text-foreground">3.2%</p>
              </div>
              <MousePointer className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-500">-0.4%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-foreground">89</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+15.7%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Optimization Tab */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Advanced AI Suggestions
              </CardTitle>
              <CardDescription>
                Comprehensive optimization recommendations powered by machine learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {advancedSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {advancedSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">
                          Expected Impact: {suggestion.expectedImpact}
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleAutoImplement(suggestion.id)}
                          disabled={!suggestion.autoImplementable}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {suggestion.autoImplementable ? 'Auto-Apply' : 'Manual Review'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No advanced suggestions available. Click "Advanced" to generate AI recommendations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Auto-Fix Page Issues
                </CardTitle>
                <CardDescription>
                  Automatically detect and resolve common page problems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Monitors your Facebook page for policy violations, engagement drops, and content issues.
                  </div>
                  <Button 
                    onClick={handleAutoFixPageIssues} 
                    disabled={isAutoFixing} 
                    className="w-full"
                  >
                    {isAutoFixing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    {isAutoFixing ? 'Fixing Issues...' : 'Auto-Fix Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Auto-Analyze Page
                </CardTitle>
                <CardDescription>
                  Comprehensive AI-powered page performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Analyzes audience behavior, content performance, and engagement patterns.
                  </div>
                  <Button 
                    onClick={handleAutoAnalyzePage} 
                    disabled={isAnalyzing} 
                    className="w-full"
                    variant="outline"
                  >
                    {isAnalyzing ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Real-time campaign performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Mon', spend: 400, conversions: 24 },
                    { name: 'Tue', spend: 300, conversions: 13 },
                    { name: 'Wed', spend: 500, conversions: 38 },
                    { name: 'Thu', spend: 280, conversions: 39 },
                    { name: 'Fri', spend: 590, conversions: 48 },
                    { name: 'Sat', spend: 320, conversions: 38 },
                    { name: 'Sun', spend: 450, conversions: 43 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="spend" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="conversions" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Tools
              </CardTitle>
              <CardDescription>
                Advanced artificial intelligence tools for campaign optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleAutoImprove} 
                  disabled={isAutoImproving} 
                  className="h-20 flex flex-col items-center justify-center"
                  variant="outline"
                >
                  {isAutoImproving ? <Clock className="h-6 w-6 mb-2 animate-spin" /> : <TrendingUp className="h-6 w-6 mb-2" />}
                  <span className="font-medium">{isAutoImproving ? 'Improving...' : 'Auto-Improve Campaign'}</span>
                  <span className="text-xs text-muted-foreground">AI optimization</span>
                </Button>

                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  variant="outline"
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="font-medium">Content Generator</span>
                  <span className="text-xs text-muted-foreground">AI copywriting</span>
                </Button>

                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  variant="outline"
                >
                  <Target className="h-6 w-6 mb-2" />
                  <span className="font-medium">Audience Optimizer</span>
                  <span className="text-xs text-muted-foreground">Smart targeting</span>
                </Button>

                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="font-medium">Performance Predictor</span>
                  <span className="text-xs text-muted-foreground">Future insights</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}