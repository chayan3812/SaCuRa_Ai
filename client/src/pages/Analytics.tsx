import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MessageSquare,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsData {
  overview: {
    totalSpend: number;
    totalReach: number;
    totalEngagement: number;
    roas: number;
    cpm: number;
    ctr: number;
    conversions: number;
    costPerConversion: number;
  };
  trends: Array<{
    date: string;
    spend: number;
    reach: number;
    engagement: number;
    conversions: number;
    impressions: number;
    clicks: number;
  }>;
  performance: Array<{
    campaign: string;
    spend: number;
    reach: number;
    engagement: number;
    roas: number;
    status: string;
  }>;
  demographics: {
    age: Array<{ range: string; percentage: number; count: number }>;
    gender: Array<{ type: string; percentage: number; count: number }>;
    location: Array<{ country: string; percentage: number; count: number }>;
  };
  timeAnalysis: {
    hourly: Array<{ hour: number; engagement: number; reach: number }>;
    daily: Array<{ day: string; performance: number }>;
  };
  contentPerformance: Array<{
    id: string;
    title: string;
    type: string;
    reach: number;
    engagement: number;
    shares: number;
    comments: number;
    likes: number;
    publishedAt: string;
  }>;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analyticsData, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", dateRange, selectedMetric],
  });

  const { data: realtimeData } = useQuery({
    queryKey: ["/api/analytics/realtime"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const exportData = () => {
    // Create CSV export functionality
    console.log("Exporting analytics data...");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const overview = analyticsData?.overview || {
    totalSpend: 0,
    totalReach: 0,
    totalEngagement: 0,
    roas: 0,
    cpm: 0,
    ctr: 0,
    conversions: 0,
    costPerConversion: 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive performance insights and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Alerts */}
      {realtimeData?.alerts && realtimeData.alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800 dark:text-amber-200">Real-time Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realtimeData.alerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-sm">{alert.message}</span>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.totalSpend)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview.totalReach)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(overview.ctr)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.roas.toFixed(2)}x</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="predictions">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Track your key metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={analyticsData?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: any, name: string) => [
                    name === 'spend' ? formatCurrency(value) : formatNumber(value),
                    name
                  ]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="spend" fill="#8884d8" name="Spend" />
                  <Line yAxisId="right" type="monotone" dataKey="reach" stroke="#82ca9d" name="Reach" />
                  <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#ffc658" name="Engagement" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>CPM (Cost per 1000 impressions)</span>
                    <span className="font-semibold">{formatCurrency(overview.cpm)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per Conversion</span>
                    <span className="font-semibold">{formatCurrency(overview.costPerConversion)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Conversions</span>
                    <span className="font-semibold">{formatNumber(overview.conversions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Likes', value: 45, color: '#0088FE' },
                        { name: 'Comments', value: 25, color: '#00C49F' },
                        { name: 'Shares', value: 20, color: '#FFBB28' },
                        { name: 'Clicks', value: 10, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of individual campaign results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.performance?.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{campaign.campaign}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Spend: {formatCurrency(campaign.spend)}</span>
                        <span>Reach: {formatNumber(campaign.reach)}</span>
                        <span>ROAS: {campaign.roas.toFixed(2)}x</span>
                      </div>
                    </div>
                    <Badge 
                      variant={campaign.status === 'active' ? 'default' : 'secondary'}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData?.demographics?.age || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Split</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.demographics?.gender || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(analyticsData?.demographics?.gender || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.demographics?.location?.slice(0, 5).map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{location.country}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{location.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimal Posting Times</CardTitle>
              <CardDescription>
                Best times to post based on audience engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData?.timeAnalysis?.hourly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="engagement" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="reach" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Your best-performing posts and their metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.contentPerformance?.slice(0, 10).map((content, index) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <h4 className="font-semibold">{content.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Reach: {formatNumber(content.reach)}</span>
                            <span>Likes: {formatNumber(content.likes)}</span>
                            <span>Comments: {formatNumber(content.comments)}</span>
                            <span>Shares: {formatNumber(content.shares)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{content.type}</Badge>
                  </div>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Data-driven suggestions to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">Budget Optimization</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Increase budget for Campaign A by 25% - projected 18% ROAS improvement
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-100">Audience Targeting</span>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Target 25-34 age group more heavily - showing 40% higher engagement
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-900 dark:text-amber-100">Posting Schedule</span>
                    </div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Post between 2-4 PM for optimal engagement based on audience activity
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Forecast</CardTitle>
                <CardDescription>
                  Predicted metrics for the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Projected Spend</span>
                    <span className="font-semibold">{formatCurrency(overview.totalSpend * 1.15)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estimated Reach</span>
                    <span className="font-semibold">{formatNumber(overview.totalReach * 1.12)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Expected ROAS</span>
                    <span className="font-semibold">{(overview.roas * 1.08).toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Goal</span>
                    <span className="font-semibold">{formatNumber(overview.conversions * 1.22)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}