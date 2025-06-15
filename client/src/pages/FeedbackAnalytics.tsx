import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  MessageSquare,
  Users,
  Lightbulb
} from "lucide-react";

interface FeedbackAnalytics {
  total: number;
  usefulCount: number;
  notUsefulCount: number;
  successRate: number;
  improvementOpportunities: number;
  dailyBreakdown: Array<{
    date: string;
    useful: number;
    total: number;
    successRate: number;
  }>;
  topNegativeMessages: Array<{
    message: string;
    aiReply: string;
    agentReply: string;
  }>;
  learningTrends: Array<{
    date: string;
    useful: number;
    total: number;
    successRate: number;
  }>;
}

export default function FeedbackAnalytics() {
  const [timeRange, setTimeRange] = useState(30);

  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: [`/api/feedback/analytics?days=${timeRange}`],
    refetchInterval: 60000, // Refresh every minute
  });

  const analytics: FeedbackAnalytics | null = (analyticsData as any)?.analytics || null;

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSuccessRateBadgeVariant = (rate: number) => {
    if (rate >= 80) return "default";
    if (rate >= 60) return "secondary";
    return "destructive";
  };

  // Prepare chart data
  const pieChartData = [
    { name: "Useful", value: analytics?.usefulCount || 0, color: "#22c55e" },
    { name: "Not Useful", value: analytics?.notUsefulCount || 0, color: "#ef4444" },
  ];

  const lineChartData = analytics?.learningTrends?.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    useful: day.useful,
    notUseful: day.total - day.useful,
    successRate: day.successRate,
  })) || [];

  const COLORS = ["#22c55e", "#ef4444"];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Feedback Analytics</h1>
            <p className="text-gray-600 mt-1">Closed-loop learning performance insights</p>
          </div>
          <div className="animate-spin">
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Feedback Analytics</h1>
          <p className="text-gray-600 mt-1">Closed-loop learning performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(7)}
            >
              7 days
            </Button>
            <Button
              variant={timeRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(30)}
            >
              30 days
            </Button>
            <Button
              variant={timeRange === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(90)}
            >
              90 days
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{analytics?.total || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(analytics?.successRate || 0)}`}>
                  {analytics?.successRate || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Helpful Responses</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.usefulCount || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Improvement</p>
                <p className="text-2xl font-bold text-red-600">{analytics?.notUsefulCount || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="replay" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning Replay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Feedback Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    {analytics?.successRate || 0}% of replies marked "Useful" in the last {timeRange} days
                  </span>
                </div>
                {analytics && analytics.notUsefulCount > 5 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">
                      {analytics.notUsefulCount} replies need improvement
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Top improvement areas: customer service responses, refund handling
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - AI Reply Usefulness % */}
            <Card>
              <CardHeader>
                <CardTitle>AI Reply Usefulness Distribution</CardTitle>
                <CardDescription>
                  Overall feedback breakdown for AI suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                    <div className="text-2xl font-bold text-green-600">{analytics?.usefulCount || 0}</div>
                    <div className="text-sm text-gray-600">Useful</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
                    <div className="text-2xl font-bold text-red-600">{analytics?.notUsefulCount || 0}</div>
                    <div className="text-sm text-gray-600">Not Useful</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Chart - Daily Usefulness Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Usefulness Trend</CardTitle>
                <CardDescription>
                  Tracking AI performance improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="useful" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Useful Replies"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="notUseful" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Not Useful Replies"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Trends</CardTitle>
              <CardDescription>
                Track AI learning progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.learningTrends?.length ? (
                  analytics.learningTrends.slice(-7).map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">
                          {day.total} responses
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                          {day.useful} helpful
                        </div>
                        <Badge variant={getSuccessRateBadgeVariant(day.successRate)}>
                          {day.successRate}%
                        </Badge>
                        {day.successRate > 80 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : day.successRate < 60 ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Target className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No trend data available yet. Generate more AI suggestions to see learning progress.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replay" className="space-y-6">
          {/* Most Rejected Replies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Most Rejected Replies</CardTitle>
              <CardDescription>
                AI responses that need improvement - for ops team review and training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Message</TableHead>
                    <TableHead>AI Reply (Rejected)</TableHead>
                    <TableHead>Agent Override</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topNegativeMessages?.length ? (
                    analytics.topNegativeMessages.map((example, index) => (
                      <TableRow key={index}>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={example.message}>
                            {example.message}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-red-600" title={example.aiReply}>
                            {example.aiReply}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {example.agentReply ? (
                            <div className="truncate text-green-600" title={example.agentReply}>
                              {example.agentReply}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">
                            Needs Training
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No rejected replies found. AI is performing excellently!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Learning Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Learning Examples</CardTitle>
              <CardDescription>
                Full conversation context for AI training improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analytics?.topNegativeMessages?.length ? (
                    analytics.topNegativeMessages.slice(0, 5).map((example, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Customer Message</span>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border-l-2 border-blue-600">
                          <p className="text-sm">{example.message}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">AI Response (Needs Improvement)</span>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded border-l-2 border-red-600">
                          <p className="text-sm">{example.aiReply}</p>
                        </div>

                        {example.agentReply && (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Agent's Better Response</span>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-950 rounded border-l-2 border-green-600">
                              <p className="text-sm">{example.agentReply}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No improvement examples available yet. The AI is performing well!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}