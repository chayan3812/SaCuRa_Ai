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
        
        <div className="p-6 space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Comprehensive AI-powered social media management overview
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>Live</span>
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
            
            {/* Key Metrics Cards */}
            <MetricsCards 
              metrics={metrics || defaultMetrics} 
              isLoading={metricsLoading} 
            />
          </div>

          {/* Enhanced Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </TabsTrigger>
              <TabsTrigger value="customer-service" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Customer Service</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Automation</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <AdPerformanceChart />
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Performance Trends</span>
                      </CardTitle>
                      <CardDescription>
                        Real-time analytics and performance metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ConnectedAccounts />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <AIRecommendations />
                  <QuickActions />
                </div>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>AI Learning Progress</span>
                    </CardTitle>
                    <CardDescription>
                      Machine learning model performance and training status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AILearningProgress />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Recommendations</CardTitle>
                    <CardDescription>
                      AI-powered insights and optimization suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AIRecommendations />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Customer Service Tab */}
            <TabsContent value="customer-service" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Customer Service Monitor</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time customer interaction monitoring and response automation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerServiceMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Employee productivity and task management overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Connected Accounts</span>
                    </CardTitle>
                    <CardDescription>
                      Social media platforms and automation status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConnectedAccounts />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Fast access to common automation tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
