import MetricsCards from "@/components/dashboard/MetricsCards";
import AdPerformanceChart from "@/components/dashboard/AdPerformanceChart";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import CustomerServiceMonitor from "@/components/dashboard/CustomerServiceMonitor";
import EmployeeMonitor from "@/components/dashboard/EmployeeMonitor";
import ConnectedAccounts from "@/components/dashboard/ConnectedAccounts";
import AILearningProgress from "@/components/dashboard/AILearningProgress";
import QuickActions from "@/components/dashboard/QuickActions";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Brain, MessageSquare, Users, TrendingUp, Settings } from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000,
  });

  const defaultMetrics: DashboardMetrics = {
    totalSpend: 0,
    totalResponses: 0,
    preventedRestrictions: 0,
    avgResponseTime: 0,
  };

  return (
    <>
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">PagePilot AI Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                AI-powered social media management overview
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="flex items-center space-x-1 bg-green-50 text-green-700 border-green-200">
                <Activity className="w-3 h-3" />
                <span>Live</span>
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Brain className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <Settings className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Real-time System Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Campaigns</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-200" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-blue-100">↗ 12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Active Pages</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Users className="h-8 w-8 text-green-200" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-green-100">↗ 3 new this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">AI Responses</p>
                    <p className="text-2xl font-bold">1.2k</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-purple-200" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-purple-100">↗ 24% today</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Monthly Spend</p>
                    <p className="text-2xl font-bold">$8.9k</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-200" />
                </div>
                <div className="mt-2">
                  <span className="text-xs text-orange-100">↗ 15% vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Chart */}
              <Card>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Campaign "Summer Sale" optimized</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                      <Badge variant="secondary">Auto</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">3 customer inquiries responded</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                      <Badge variant="secondary">AI</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New content scheduled for posting</p>
                        <p className="text-xs text-muted-foreground">12 minutes ago</p>
                      </div>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-6">
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

          {/* Bottom Section - Additional Modules */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CustomerServiceMonitor />
            <EmployeeMonitor />
          </div>
    </>
  );
}