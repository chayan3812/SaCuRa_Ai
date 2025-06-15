import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Distribution</CardTitle>
                <CardDescription>
                  How users rate AI suggestions over time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Helpful Responses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analytics?.usefulCount || 0}</span>
                      <Badge variant="default" className="text-green-600 border-green-200">
                        {analytics?.total ? Math.round((analytics.usefulCount / analytics.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={analytics?.total ? (analytics.usefulCount / analytics.total) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Needs Improvement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analytics?.notUsefulCount || 0}</span>
                      <Badge variant="destructive" className="text-red-600 border-red-200">
                        {analytics?.total ? Math.round((analytics.notUsefulCount / analytics.total) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={analytics?.total ? (analytics.notUsefulCount / analytics.total) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  AI improvement metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{analytics?.total || 0}</p>
                    <p className="text-xs text-gray-600">Training Samples</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{analytics?.improvementOpportunities || 0}</p>
                    <p className="text-xs text-gray-600">Improvement Areas</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Learning Efficiency</span>
                    <Badge variant={getSuccessRateBadgeVariant(analytics?.successRate || 0)}>
                      {analytics?.successRate || 0}%
                    </Badge>
                  </div>
                  <Progress value={analytics?.successRate || 0} className="h-2" />
                </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Learning Replay</CardTitle>
              <CardDescription>
                Review failed responses and agent corrections for AI improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analytics?.topNegativeMessages?.length ? (
                    analytics.topNegativeMessages.map((example, index) => (
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