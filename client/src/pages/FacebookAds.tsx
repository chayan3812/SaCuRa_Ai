/**
 * Facebook Ads Management Page
 * Complete advertising management interface for SaCuRa AI platform
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import FacebookAdsManager from "@/components/facebook/FacebookAdsManager";
import { useFacebookAdsDashboard } from "@/hooks/useFacebookAds";
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye,
  MousePointer
} from "lucide-react";

export default function FacebookAds() {
  const [activeView, setActiveView] = useState("overview");
  const adsData = useFacebookAdsDashboard();

  const performance = adsData.performance.data;
  const campaigns = adsData.campaigns.data || [];
  const accounts = adsData.accounts.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Facebook Ads Manager
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced advertising management with AI-powered optimization and real-time performance analytics
          </p>
          
          {/* Connection Status */}
          <div className="flex justify-center">
            <Badge variant={adsData.hasError ? 'destructive' : 'default'} className="px-4 py-2">
              {adsData.hasError ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Connection Required
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Facebook Marketing API Connected
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Ad Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance ? `$${performance.totalSpend.toFixed(2)}` : '$0.00'}
              </div>
              <p className="text-xs text-blue-100">
                Last 30 days performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance?.totalImpressions.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-green-100">
                Total reach achieved
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance ? `${performance.averageCTR.toFixed(2)}%` : '0.00%'}
              </div>
              <p className="text-xs text-purple-100">
                Average CTR performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Conversions</CardTitle>
              <Target className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance?.totalConversions || 0}
              </div>
              <p className="text-xs text-orange-100">
                Total conversions tracked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Alert for New Users */}
        {adsData.hasError && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Facebook Marketing API Setup Required:</strong> To use advanced advertising features, 
              configure your Facebook App credentials in the environment settings. This enables campaign management, 
              audience targeting, and performance analytics.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="manager">Campaign Manager</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Account Summary</span>
                  </CardTitle>
                  <CardDescription>
                    Your Facebook advertising account overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {adsData.accounts.isLoading ? (
                    <p className="text-muted-foreground">Loading account information...</p>
                  ) : accounts.length > 0 ? (
                    <div className="space-y-3">
                      {accounts.slice(0, 3).map((account: any) => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.currency} • {account.timezone_name}
                            </p>
                          </div>
                          <Badge variant={account.account_status === 1 ? 'default' : 'secondary'}>
                            {account.account_status === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No ad accounts found</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Active Campaigns</span>
                  </CardTitle>
                  <CardDescription>
                    Currently running advertising campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {adsData.campaigns.isLoading ? (
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  ) : campaigns.length > 0 ? (
                    <div className="space-y-3">
                      {campaigns.slice(0, 3).map((campaign: any) => (
                        <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">{campaign.objective}</p>
                          </div>
                          <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No active campaigns</p>
                      <Button onClick={() => setActiveView("manager")} size="sm">
                        Create Your First Campaign
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            {performance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Performance Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators for your advertising efforts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        ${performance.averageCPC.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Average CPC</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ${performance.averageCPM.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Average CPM</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {performance.conversionRate.toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {performance.totalClicks.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Campaign Manager Tab */}
          <TabsContent value="manager" className="space-y-6">
            <FacebookAdsManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Detailed performance analysis and optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performance ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <h4 className="font-medium">Engagement Metrics</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Click-Through Rate:</span>
                            <span className="font-medium">{performance.averageCTR.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Impressions:</span>
                            <span className="font-medium">{performance.totalImpressions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Clicks:</span>
                            <span className="font-medium">{performance.totalClicks.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Cost Efficiency</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Cost Per Click:</span>
                            <span className="font-medium">${performance.averageCPC.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost Per Mille:</span>
                            <span className="font-medium">${performance.averageCPM.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Spend:</span>
                            <span className="font-medium">${performance.totalSpend.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Conversion Tracking</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Conversions:</span>
                            <span className="font-medium">{performance.totalConversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Rate:</span>
                            <span className="font-medium">{performance.conversionRate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost per Conversion:</span>
                            <span className="font-medium">
                              ${performance.totalConversions > 0 ? (performance.totalSpend / performance.totalConversions).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                      <div className="space-y-2">
                        {performance.averageCTR < 1.0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Consider improving ad creative to increase click-through rate above 1.0%
                            </AlertDescription>
                          </Alert>
                        )}
                        {performance.averageCPC > 2.0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              High cost per click detected. Consider refining audience targeting to reduce costs.
                            </AlertDescription>
                          </Alert>
                        )}
                        {performance.conversionRate < 2.0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Low conversion rate. Review landing page experience and ad relevance.
                            </AlertDescription>
                          </Alert>
                        )}
                        {performance.averageCTR >= 1.0 && performance.averageCPC <= 2.0 && performance.conversionRate >= 2.0 && (
                          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Excellent performance! Consider scaling successful campaigns to maximize results.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Analytics data will appear here once you have active campaigns
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