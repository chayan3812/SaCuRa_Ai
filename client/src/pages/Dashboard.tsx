import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MetricsCards from "@/components/dashboard/MetricsCards";
import AdPerformanceChart from "@/components/dashboard/AdPerformanceChart";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import CustomerServiceMonitor from "@/components/dashboard/CustomerServiceMonitor";
import EmployeeMonitor from "@/components/dashboard/EmployeeMonitor";
import ConnectedAccounts from "@/components/dashboard/ConnectedAccounts";
import AILearningProgress from "@/components/dashboard/AILearningProgress";
import QuickActions from "@/components/dashboard/QuickActions";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import RealTimeAlerts from "@/components/RealTimeAlerts";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, BarChart3, Brain, MessageSquare, Users, Zap, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        
        <div className="container-responsive space-y-4 md:space-y-6 py-4 md:py-6">
          {/* Dashboard Header - Responsive */}
          <div className="flex flex-col space-y-3 md:space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="space-y-1">
                <h1 className="heading-responsive">Dashboard</h1>
                <p className="text-responsive text-muted-foreground">
                  AI-powered social media management overview
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                  <Activity className="h-3 w-3" />
                  <span>Live</span>
                </Badge>
                <Button variant="outline" size="sm" className="button-responsive w-fit">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Customize</span>
                  <span className="sm:hidden">Settings</span>
                </Button>
              </div>
            </div>
            
            {/* Key Metrics Cards - Always responsive */}
            <MetricsCards 
              metrics={metrics || defaultMetrics} 
              isLoading={metricsLoading} 
            />
          </div>

          {/* Enhanced Tabbed Interface - Mobile-first responsive */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 sm:p-3 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden text-xs">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 sm:p-3 text-xs sm:text-sm">
                <Brain className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">AI Insights</span>
                <span className="sm:hidden text-xs">AI</span>
              </TabsTrigger>
              <TabsTrigger value="customer-service" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 sm:p-3 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden md:inline">Customer Service</span>
                <span className="md:hidden text-xs">Service</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 sm:p-3 text-xs sm:text-sm">
                <Users className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Team</span>
                <span className="sm:hidden text-xs">Team</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 p-2 sm:p-3 text-xs sm:text-sm col-span-2 sm:col-span-1">
                <Zap className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">Automation</span>
                <span className="sm:hidden text-xs">Auto</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Responsive Grid Layout */}
            <TabsContent value="overview" className="space-y-4 md:space-y-6 mt-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
                <div className="xl:col-span-2 space-y-4 md:space-y-6">
                  <div className="card-responsive">
                    <AdPerformanceChart />
                  </div>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-base sm:text-lg">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Performance Trends</span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Real-time analytics and performance metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ConnectedAccounts />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="card-responsive">
                    <AIRecommendations />
                  </div>
                  <div className="card-responsive">
                    <QuickActions />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Insights Tab - Responsive Layout */}
            <TabsContent value="ai-insights" className="space-y-4 md:space-y-6 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-base sm:text-lg">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>AI Learning Progress</span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Machine learning model performance and training status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <AILearningProgress />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Smart Recommendations</CardTitle>
                    <CardDescription className="text-sm">
                      AI-powered insights and optimization suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <AIRecommendations />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Customer Service Tab - Single Column on Mobile */}
            <TabsContent value="customer-service" className="space-y-4 md:space-y-6 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-base sm:text-lg">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Customer Service Monitor</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Real-time customer interaction monitoring and response automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <CustomerServiceMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab - Single Column Layout */}
            <TabsContent value="team" className="space-y-4 md:space-y-6 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Team Performance</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Employee productivity and task management overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <EmployeeMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab - Responsive Two-Column Layout */}
            <TabsContent value="automation" className="space-y-4 md:space-y-6 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-base sm:text-lg">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Connected Accounts</span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Social media platforms and automation status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ConnectedAccounts />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                    <CardDescription className="text-sm">
                      Fast access to common automation tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <QuickActions />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Real-time Status Bar */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">System Status: Operational</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Active Campaigns</div>
                    <div className="text-lg font-semibold">12</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">AI Response Rate</div>
                    <div className="text-lg font-semibold text-green-600">98.5%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Memory Usage</div>
                    <div className="text-lg font-semibold text-amber-600">94.6%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Components */}
      <FloatingAIAssistant />
      <RealTimeAlerts />
    </div>
  );
}
