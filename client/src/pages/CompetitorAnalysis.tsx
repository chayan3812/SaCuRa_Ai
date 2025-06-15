import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Share, 
  AlertTriangle,
  Target,
  BarChart3,
  Globe,
  Calendar,
  Loader
} from 'lucide-react';

interface CompetitorPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  reactions?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
  shares?: { count: number };
}

interface CompetitorAnalysisResult {
  strategy: string;
  contentStyle: string;
  audienceEngagement: string;
  postingFrequency: string;
  keyInsights: string[];
  recommendations: string[];
  strengths: string[];
  opportunities: string[];
}

export default function CompetitorAnalysis() {
  const [pageIdInput, setPageIdInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    posts: CompetitorPost[];
    analysis: CompetitorAnalysisResult;
  } | null>(null);
  const { toast } = useToast();

  const { data: competitors, isLoading: competitorsLoading } = useQuery({
    queryKey: ['/api/competitors'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: intelligenceReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/competitors/intelligence-report'],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/competitors/trends'],
    refetchInterval: 120000 // Refresh every 2 minutes
  });

  const addCompetitorMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest('/api/competitors', {
        method: 'POST',
        body: JSON.stringify({ website: url })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitors'] });
      setNewCompetitorUrl('');
    }
  });

  const startMonitoringMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/competitors/start-monitoring', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitors'] });
    }
  });

  const handleAddCompetitor = () => {
    if (newCompetitorUrl) {
      addCompetitorMutation.mutate(newCompetitorUrl);
    }
  };

  if (competitorsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading competitor intelligence...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Competitor Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Monitor competitor strategies, pricing, and performance in real-time
          </p>
        </div>

        {/* Add Competitor Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Competitor
            </CardTitle>
            <CardDescription>
              Enter a competitor's website URL to start monitoring their advertising and pricing strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="https://competitor-website.com"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddCompetitor}
                disabled={addCompetitorMutation.isPending || !newCompetitorUrl}
              >
                {addCompetitorMutation.isPending ? 'Adding...' : 'Add Competitor'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => startMonitoringMutation.mutate()}
                disabled={startMonitoringMutation.isPending}
              >
                {startMonitoringMutation.isPending ? 'Starting...' : 'Start Monitoring'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ads">Ad Intelligence</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Monitor</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Competitors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitors?.map((competitor: any) => (
                <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        <CardDescription>{competitor.industry}</CardDescription>
                      </div>
                      <Badge variant={competitor.status === 'active' ? 'default' : 'secondary'}>
                        {competitor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-400">Website</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{competitor.marketShare}% share</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-600 dark:text-gray-400">Last updated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{competitor.adsCount || 0} ads</span>
                      </div>
                    </div>
                    
                    {competitor.recentActivity && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Recent Activity</h4>
                        <div className="space-y-2">
                          {competitor.recentActivity.slice(0, 2).map((activity: any, index: number) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.type === 'new_ad' && (
                                <div className="flex items-center gap-2">
                                  <Eye className="h-3 w-3" />
                                  New ad campaign detected
                                </div>
                              )}
                              {activity.type === 'price_change' && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-3 w-3" />
                                  Pricing update: {activity.change}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Intelligence Report Summary */}
            {intelligenceReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Intelligence Report Summary
                  </CardTitle>
                  <CardDescription>
                    Generated {new Date(intelligenceReport.generatedAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Strategic Insights</h4>
                      <div className="space-y-1">
                        {intelligenceReport.strategicInsights?.slice(0, 3).map((insight: any, index: number) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            • {insight.title}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations</h4>
                      <div className="space-y-1">
                        {intelligenceReport.recommendations?.slice(0, 3).map((rec: any, index: number) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            • {rec.title}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Alerts</h4>
                      <div className="space-y-1">
                        {intelligenceReport.alerts?.slice(0, 3).map((alert: any, index: number) => (
                          <Alert key={index} className="py-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              {alert.title}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competitors?.map((competitor: any) => (
                <Card key={competitor.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{competitor.name} - Ad Analysis</CardTitle>
                    <CardDescription>Recent advertising activities and strategies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {competitor.ads && competitor.ads.length > 0 ? (
                      <div className="space-y-4">
                        {competitor.ads.slice(0, 3).map((ad: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{ad.platform} Campaign</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {ad.adType} • Est. Budget: ${ad.performance.estimatedBudget.daily}/day
                                </p>
                              </div>
                              <Badge variant="outline">{ad.performance.engagementRate}% engagement</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-sm">Headlines:</span>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {ad.creativeAssets.headlines.slice(0, 2).join(' • ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-sm">Strategy:</span>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {ad.analysis.strategy}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Reach: {ad.performance.estimatedReach.toLocaleString()}</span>
                              <span>Running {ad.performance.runDuration} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No ad data available yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competitors?.map((competitor: any) => (
                <Card key={competitor.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{competitor.name} - Pricing Analysis</CardTitle>
                    <CardDescription>Current pricing and recent changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {competitor.pricing && competitor.pricing.products ? (
                      <div className="space-y-4">
                        {competitor.pricing.products.map((product: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{product.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">${product.price}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{product.pricingModel}</div>
                              </div>
                            </div>
                            
                            {product.priceHistory && product.priceHistory.length > 1 && (
                              <div className="flex items-center gap-2 text-sm">
                                {product.priceHistory[product.priceHistory.length - 1].price > 
                                 product.priceHistory[product.priceHistory.length - 2].price ? (
                                  <TrendingUp className="h-4 w-4 text-red-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-green-500" />
                                )}
                                <span>
                                  Price change: ${product.priceHistory[product.priceHistory.length - 2].price} → ${product.price}
                                </span>
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Features: {product.features.slice(0, 3).join(', ')}
                              {product.features.length > 3 && ` +${product.features.length - 3} more`}
                            </div>
                          </div>
                        ))}
                        
                        {competitor.pricing.promotions && competitor.pricing.promotions.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Active Promotions</h4>
                            {competitor.pricing.promotions.map((promo: any, index: number) => (
                              <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-medium">{promo.description}</span>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {promo.discount}% off • Valid until {new Date(promo.validTo).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <Badge variant="secondary">{promo.type}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No pricing data available yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Market Trends Analysis
                </CardTitle>
                <CardDescription>
                  Emerging trends detected from competitor activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trends && trends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trends.map((trend: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{trend.type.replace('_', ' ').toUpperCase()}</h4>
                          <Badge variant={trend.trend === 'rising' ? 'default' : 'secondary'}>
                            {trend.trend}
                          </Badge>
                        </div>
                        
                        {trend.platform && (
                          <div className="text-sm">
                            <span className="font-medium">Platform:</span> {trend.platform}
                          </div>
                        )}
                        
                        {trend.adType && (
                          <div className="text-sm">
                            <span className="font-medium">Ad Type:</span> {trend.adType}
                          </div>
                        )}
                        
                        {trend.adCount && (
                          <div className="text-sm">
                            <span className="font-medium">Usage:</span> {trend.adCount} ads detected
                          </div>
                        )}
                        
                        {trend.percentage && (
                          <div className="text-sm">
                            <span className="font-medium">Market Share:</span> {trend.percentage.toFixed(1)}%
                          </div>
                        )}
                        
                        {trend.averageDailyBudget && (
                          <div className="text-sm">
                            <span className="font-medium">Avg Budget:</span> ${trend.averageDailyBudget.toFixed(0)}/day
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Trends Detected Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add competitors and start monitoring to detect market trends
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}