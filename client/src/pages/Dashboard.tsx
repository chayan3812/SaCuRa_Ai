import MetricsCards from "@/components/dashboard/MetricsCards";
import AdPerformanceChart from "@/components/dashboard/AdPerformanceChart";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import CustomerServiceMonitor from "@/components/dashboard/CustomerServiceMonitor";
import EmployeeMonitor from "@/components/dashboard/EmployeeMonitor";
import ConnectedAccounts from "@/components/dashboard/ConnectedAccounts";
import AILearningProgress from "@/components/dashboard/AILearningProgress";
import QuickActions from "@/components/dashboard/QuickActions";
import LiveSystemStatus from "@/components/dashboard/LiveSystemStatus";
import PerformanceInsights from "@/components/dashboard/PerformanceInsights";
import AdvancedAnalyticsChart from "@/components/dashboard/AdvancedAnalyticsChart";
import FuturisticMetricsGrid from "@/components/dashboard/FuturisticMetricsGrid";
import CircularProgressDashboard from "@/components/dashboard/CircularProgressDashboard";
import RealTimeDataVisualizer from "@/components/dashboard/RealTimeDataVisualizer";
import FloatingActionPanel from "@/components/dashboard/FloatingActionPanel";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, BarChart3, Brain, MessageSquare, Users, TrendingUp, Settings, Zap, Target, DollarSign, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000,
  });

  const { data: facebookPages, isLoading: pagesLoading } = useQuery({
    queryKey: ['/api/facebook/pages'],
    refetchInterval: 60000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 15000,
  });

  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 30000,
  });

  const { data: customerInteractions } = useQuery({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 20000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const defaultMetrics: DashboardMetrics = {
    totalSpend: 0,
    totalResponses: 0,
    preventedRestrictions: 0,
    avgResponseTime: 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-700">
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 animate-in slide-in-from-top duration-500">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">SaCuRa AI Dashboard</h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                AI-powered Facebook marketing automation platform
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="flex items-center space-x-1 bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live</span>
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
                <Brain className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
              {aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs sm:text-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  {(aiMetrics as any).customerToneAnalysis}% Accuracy
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="text-xs sm:text-sm">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Sync</span>
              </Button>
            </div>
          </div>

          {/* Real-time System Status */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-in slide-in-from-bottom duration-600 delay-100">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group animate-in zoom-in duration-500 delay-150">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-100 text-xs sm:text-sm truncate">Total Spend</p>
                    {metricsLoading ? (
                      <Skeleton className="h-6 w-16 bg-blue-400" />
                    ) : (
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">
                        {formatCurrency(metrics?.totalSpend || 0)}
                      </p>
                    )}
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-200 flex-shrink-0 group-hover:animate-bounce" />
                </div>
                <div className="mt-1 sm:mt-2">
                  <span className="text-xs text-blue-100">
                    {metrics?.totalSpend ? "↗ Live tracking" : "⏸ No campaigns"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group animate-in zoom-in duration-500 delay-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-green-100 text-xs sm:text-sm truncate">Facebook Pages</p>
                    {pagesLoading ? (
                      <Skeleton className="h-6 w-8 bg-green-400" />
                    ) : (
                      <p className="text-lg sm:text-xl md:text-2xl font-bold">
                        {Array.isArray(facebookPages) ? facebookPages.length : 0}
                      </p>
                    )}
                  </div>
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-200 flex-shrink-0 group-hover:animate-pulse" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-green-100">
                    {Array.isArray(facebookPages) && facebookPages.length > 0 ? "✓ Connected" : "⚠ Setup required"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group animate-in zoom-in duration-500 delay-300">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-purple-100 text-xs sm:text-sm truncate">AI Responses</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">
                      {formatNumber(metrics?.totalResponses || 0)}
                    </p>
                  </div>
                  <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-200 flex-shrink-0 group-hover:animate-spin" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-purple-100">
                    {aiMetrics && typeof aiMetrics === 'object' && 'responseQuality' in aiMetrics 
                      ? `${(aiMetrics as any).responseQuality || 85}% quality` : "AI Ready"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group animate-in zoom-in duration-500 delay-[400ms]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-orange-100 text-xs sm:text-sm truncate">Avg Response</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">
                      {metrics?.avgResponseTime || 0}s
                    </p>
                  </div>
                  <Target className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-200 flex-shrink-0 group-hover:animate-ping" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-orange-100">
                    {metrics?.avgResponseTime && metrics.avgResponseTime < 30 ? "⚡ Fast" : "📈 Optimizing"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-700 delay-200">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 animate-in slide-in-from-left duration-600 delay-300">
              {/* Performance Chart */}
              <Card className="hover:shadow-lg transition-shadow duration-300 animate-in zoom-in duration-500 delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Campaign Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Real-time performance metrics across all campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdPerformanceChart />
                </CardContent>
              </Card>

              {/* Key Metrics Grid */}
              <MetricsCards metrics={metrics || defaultMetrics} isLoading={metricsLoading} />

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Recent Activities
                  </CardTitle>
                  <CardDescription>
                    Live system activities and AI actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications && Array.isArray(notifications) && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                              {notification.title || "System Activity"}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              {notification.description || "Real-time update"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                            {notification.type || "Live"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">AI Learning System Active</p>
                            <p className="text-xs text-green-600 dark:text-green-300">
                              {aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics 
                                ? `Processing ${(aiMetrics as any).customerToneAnalysis || 85}% accuracy rate` : "System ready"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200">AI</Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Customer Service Monitor</p>
                            <p className="text-xs text-purple-600 dark:text-purple-300">
                              {customerInteractions && Array.isArray(customerInteractions) 
                                ? `${customerInteractions.length} interactions tracked` 
                                : "Ready for customer interactions"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200">Monitor</Badge>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Facebook Integration</p>
                            <p className="text-xs text-orange-600 dark:text-orange-300">
                              {Array.isArray(facebookPages) && facebookPages.length > 0 
                                ? `${facebookPages.length} pages connected` 
                                : "Setup required for full functionality"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200">
                            {Array.isArray(facebookPages) && facebookPages.length > 0 ? "Active" : "Setup"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-6 animate-in slide-in-from-right duration-600 delay-400">
              {/* Live System Status */}
              <LiveSystemStatus />
              
              {/* AI Recommendations */}
              <AIRecommendations />
              
              {/* Quick Actions */}
              <QuickActions />
              
              {/* AI Learning Progress */}
              <AILearningProgress />
              
              {/* Connected Accounts */}
              <ConnectedAccounts />
            </div>
          </div>

          {/* Advanced Analytics Section */}
          <div className="space-y-6 animate-in fade-in duration-800 delay-500">
            {/* Real-Time Data Visualizer */}
            <RealTimeDataVisualizer />
            
            {/* Main Analytics Chart */}
            <AdvancedAnalyticsChart />
            
            {/* Futuristic Metrics Grid */}
            <FuturisticMetricsGrid />
            
            {/* Circular Progress Dashboard */}
            <CircularProgressDashboard />
          </div>

          {/* Bottom Section - Additional Modules */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-600 delay-700">
            <CustomerServiceMonitor />
            <EmployeeMonitor />
            <PerformanceInsights />
          </div>

          {/* Floating Action Panel */}
          <FloatingActionPanel />
    </div>
  );
}