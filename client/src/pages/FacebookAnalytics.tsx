import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  Lightbulb,
  BarChart3,
  Calendar,
  RefreshCw
} from "lucide-react";

interface ConversionData {
  event_name: string;
  count: number;
  value: number;
  cost_per_conversion: number;
  conversion_rate: number;
}

interface AudienceInsight {
  age_range: string;
  gender: string;
  location: string;
  interests: string[];
  behaviors: string[];
  reach: number;
  frequency: number;
}

interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  frequency: number;
  reach: number;
}

interface PixelAnalysis {
  totalEvents: number;
  uniqueUsers: number;
  conversionRate: number;
  averageOrderValue: number;
  topEvents: Array<{ name: string; count: number; value: number }>;
  insights: string[];
}

interface OptimizationRecommendation {
  type: 'audience' | 'creative' | 'bidding' | 'budget';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: string[];
}

export default function FacebookAnalytics() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Fetch conversion data
  const { data: conversionsData, isLoading: loadingConversions, refetch: refetchConversions } = useQuery({
    queryKey: ['/api/facebook-analytics/conversions', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`/api/facebook-analytics/conversions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch conversion data');
      return response.json();
    }
  });

  // Fetch audience insights
  const { data: audienceData, isLoading: loadingAudience } = useQuery({
    queryKey: ['/api/facebook-analytics/audience-insights'],
    queryFn: async () => {
      const response = await fetch('/api/facebook-analytics/audience-insights');
      if (!response.ok) throw new Error('Failed to fetch audience insights');
      return response.json();
    }
  });

  // Fetch campaign performance
  const { data: campaignData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['/api/facebook-analytics/campaign-performance', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`/api/facebook-analytics/campaign-performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch campaign performance');
      return response.json();
    }
  });

  // Fetch pixel performance
  const { data: pixelData, isLoading: loadingPixel } = useQuery({
    queryKey: ['/api/facebook-analytics/pixel-performance'],
    queryFn: async () => {
      const response = await fetch('/api/facebook-analytics/pixel-performance');
      if (!response.ok) throw new Error('Failed to fetch pixel performance');
      return response.json();
    }
  });

  // Fetch optimization recommendations
  const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['/api/facebook-analytics/optimization-recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/facebook-analytics/optimization-recommendations');
      if (!response.ok) throw new Error('Failed to fetch optimization recommendations');
      return response.json();
    }
  });

  const conversions: ConversionData[] = conversionsData?.conversions || [];
  const audience: AudienceInsight[] = audienceData?.insights || [];
  const campaigns: CampaignPerformance[] = campaignData?.campaigns || [];
  const pixelAnalysis: PixelAnalysis = pixelData?.analysis || {
    totalEvents: 0,
    uniqueUsers: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    topEvents: [],
    insights: []
  };
  const recommendations: OptimizationRecommendation[] = recommendationsData?.recommendations || [];

  const refreshAllData = () => {
    refetchConversions();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Facebook Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights from your Facebook Pixel and advertising campaigns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1 border rounded-md text-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1 border rounded-md text-sm"
            />
          </div>
          <Button onClick={refreshAllData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="recommendations">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Pixel Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(pixelAnalysis.totalEvents)}</div>
                <p className="text-xs text-muted-foreground">Across all event types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(pixelAnalysis.uniqueUsers)}</div>
                <p className="text-xs text-muted-foreground">Tracked by pixel</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(pixelAnalysis.conversionRate)}</div>
                <p className="text-xs text-muted-foreground">Overall funnel performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pixelAnalysis.averageOrderValue)}</div>
                <p className="text-xs text-muted-foreground">Per conversion</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Events */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pixel Events</CardTitle>
              <CardDescription>Most frequent events tracked by your Facebook Pixel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pixelAnalysis.topEvents.map((event, index) => (
                  <div key={event.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">{formatNumber(event.count)} events</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(event.value)}</p>
                      <p className="text-sm text-muted-foreground">Total value</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Automated analysis of your pixel performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pixelAnalysis.insights.map((insight, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <div className="grid gap-4">
            {loadingConversions ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading conversion data...
                  </div>
                </CardContent>
              </Card>
            ) : (
              conversions.map((conversion) => (
                <Card key={conversion.event_name}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{conversion.event_name}</CardTitle>
                      <Badge variant="outline">{formatNumber(conversion.count)} conversions</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">{formatCurrency(conversion.value)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost per Conversion</p>
                        <p className="text-2xl font-bold">{formatCurrency(conversion.cost_per_conversion)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{formatPercentage(conversion.conversion_rate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Performance</p>
                        <Progress value={conversion.conversion_rate * 100} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {loadingCampaigns ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading campaign data...
                  </div>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign) => (
                <Card key={campaign.campaign_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                    <CardDescription>Campaign ID: {campaign.campaign_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Spend</p>
                        <p className="text-lg font-bold">{formatCurrency(campaign.spend)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROAS</p>
                        <p className="text-lg font-bold">{campaign.roas.toFixed(2)}x</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-lg font-bold">{formatNumber(campaign.impressions)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-lg font-bold">{formatNumber(campaign.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="text-lg font-bold">{formatPercentage(campaign.ctr)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                        <p className="text-lg font-bold">{formatNumber(campaign.conversions)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4">
            {loadingAudience ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading audience data...
                  </div>
                </CardContent>
              </Card>
            ) : (
              audience.map((segment, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {segment.age_range} • {segment.gender} • {segment.location}
                    </CardTitle>
                    <CardDescription>
                      Reach: {formatNumber(segment.reach)} • Frequency: {segment.frequency.toFixed(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {segment.interests.map((interest) => (
                            <Badge key={interest} variant="secondary">{interest}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Behaviors</p>
                        <div className="flex flex-wrap gap-2">
                          {segment.behaviors.map((behavior) => (
                            <Badge key={behavior} variant="outline">{behavior}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {loadingRecommendations ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading optimization recommendations...
                  </div>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription className="mt-1">{rec.description}</CardDescription>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Expected Impact: {rec.expectedImpact}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Implementation Steps:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {rec.implementation.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}