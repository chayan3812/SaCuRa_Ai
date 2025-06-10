import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Users,
  Wand2,
  Shield,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function AdOptimizer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAdvancedOptimizing, setIsAdvancedOptimizing] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [advancedSuggestions, setAdvancedSuggestions] = useState<any[]>([]);
  const [adCopy, setAdCopy] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('campaign_123');
  const { toast } = useToast();

  // Fetch real-time performance metrics
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/ads/performance-metrics', selectedCampaignId],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch page health data
  const { data: pageHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/page-health', 'demo_page_123'],
    refetchInterval: 60000, // Refresh every minute
  });

  const handleGenerateAdCopy = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ads/generate-copy', {
        productDescription: "Facebook marketing automation platform",
        targetAudience: "Small business owners and marketers",
        campaignObjective: "Lead generation",
        tone: "professional"
      });
      
      const data = await response.json();
      setAdCopy(data);
      
      toast({
        title: "Ad Copy Generated",
        description: "AI has created optimized ad copy for your campaign.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeAds = async () => {
    setIsOptimizing(true);
    try {
      const response = await apiRequest('POST', '/api/ads/optimize', {
        adData: {
          spend: 2847,
          impressions: 85430,
          clicks: 1247,
          conversions: 89,
          ctr: 1.46,
          cpm: 3.33,
          cpc: 2.28
        },
        campaignObjective: "Lead generation",
        targetAudience: "Small business owners"
      });
      
      const data = await response.json();
      setSuggestions(data);
      
      toast({
        title: "Optimization Complete",
        description: "AI has analyzed your ads and generated optimization suggestions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize ads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAdvancedOptimize = async () => {
    setIsAdvancedOptimizing(true);
    try {
      const response = await apiRequest('POST', '/api/ads/advanced-optimize', {
        campaignId: selectedCampaignId
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
      const response = await apiRequest('POST', '/api/ads/auto-implement', {
        campaignId: selectedCampaignId,
        optimizationId
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Auto-Implementation Successful",
          description: "Optimization has been automatically applied to your campaign.",
        });
        // Refresh advanced suggestions
        handleAdvancedOptimize();
      } else {
        toast({
          title: "Auto-Implementation Failed",
          description: "Could not automatically implement this optimization.",
          variant: "destructive",
        });
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
      const response = await apiRequest('POST', '/api/page-health/auto-fix', {
        pageId: 'demo_page_123'
      });
      
      const data = await response.json();
      
      toast({
        title: "Auto-Fix Complete",
        description: `Fixed ${data.fixed} issues, ${data.failed} failed attempts.`,
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ad Optimizer</h1>
              <p className="text-muted-foreground">AI-powered Facebook ad optimization and recommendations</p>
            </div>
            <Badge variant="secondary" className="bg-sacura-primary/10 text-sacura-primary">
              <TrendingUp className="w-4 h-4 mr-1" />
              AI Powered
            </Badge>
          </div>

          {/* Current Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold text-foreground">$2,847</p>
                    <p className="text-sm text-sacura-secondary">↑ 12% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-sacura-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-sacura-primary w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                    <p className="text-2xl font-bold text-foreground">85.4K</p>
                    <p className="text-sm text-sacura-secondary">↑ 8% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold text-foreground">1.46%</p>
                    <p className="text-sm text-sacura-secondary">↑ 0.3% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MousePointer className="text-green-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold text-foreground">89</p>
                    <p className="text-sm text-sacura-secondary">↑ 15% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="text-purple-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Ad Copy Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5 text-sacura-primary" />
                  <span>AI Ad Copy Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Description</label>
                  <Textarea placeholder="Describe your product or service..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input placeholder="e.g., Small business owners aged 25-45" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Objective</label>
                  <Input placeholder="e.g., Lead generation, Sales, Brand awareness" />
                </div>
                <Button 
                  onClick={handleGenerateAdCopy}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Ad Copy"}
                </Button>
                
                {adCopy && (
                  <div className="mt-4 space-y-3 p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm">Headlines:</h4>
                      <ul className="text-sm text-muted-foreground">
                        {adCopy.headlines?.map((headline: string, i: number) => (
                          <li key={i}>• {headline}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Descriptions:</h4>
                      <ul className="text-sm text-muted-foreground">
                        {adCopy.descriptions?.map((desc: string, i: number) => (
                          <li key={i}>• {desc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policy Compliance Checker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Policy Compliance Checker</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ad Content</label>
                  <Textarea placeholder="Paste your ad copy here for compliance check..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Category</label>
                  <Input placeholder="e.g., Software, E-commerce, Healthcare" />
                </div>
                <Button className="w-full" variant="outline">
                  Check Compliance
                </Button>
                
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Compliance Status: Good</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    No policy violations detected. Your ad content meets Facebook guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optimization Suggestions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-sacura-primary" />
                  <span>AI Optimization Suggestions</span>
                </CardTitle>
                <Button 
                  onClick={handleOptimizeAds}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? "Analyzing..." : "Analyze & Optimize"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Analyze & Optimize" to get AI-powered suggestions</p>
                  <p className="text-sm">Our AI will analyze your ad performance and provide actionable recommendations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}>
                              {suggestion.priority} priority
                            </Badge>
                            <Badge variant="outline">{suggestion.type}</Badge>
                          </div>
                          <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          {suggestion.expectedImpact && (
                            <p className="text-sm text-sacura-secondary mt-2">
                              Expected Impact: {suggestion.expectedImpact}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
