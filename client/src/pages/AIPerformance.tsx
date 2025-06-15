import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, ThumbsUp, ThumbsDown, Clock, BarChart3, Zap } from "lucide-react";

interface AIPerformanceMetrics {
  period: string;
  metrics: {
    totalSuggestions: number;
    positiveRating: number;
    negativeRating: number;
    usageRate: number;
    avgResponseTime: number;
  };
  qualityScore: number;
  trend: 'improving' | 'needs_attention';
}

export default function AIPerformance() {
  const [timePeriod, setTimePeriod] = useState<string>("30");

  const { data: performanceData, isLoading } = useQuery<AIPerformanceMetrics>({
    queryKey: ["/api/ai-performance-metrics", timePeriod],
    queryFn: () => 
      fetch(`/api/ai-performance-metrics?days=${timePeriod}`)
        .then(res => res.json()),
  });

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'improving' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <BarChart3 className="h-4 w-4 text-yellow-500" />
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">AI Performance Dashboard</h1>
            <p className="text-gray-600">Loading performance metrics...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = performanceData?.metrics;

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              AI Performance Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor and analyze AI suggestion quality and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Quality Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                <Badge className={`${getQualityScoreColor(performanceData?.qualityScore || 0)} text-lg px-3 py-1`}>
                  {performanceData?.qualityScore || 0}%
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {getTrendIcon(performanceData?.trend || 'needs_attention')}
                <span className="capitalize">{performanceData?.trend || 'Unknown'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Suggestions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suggestions</CardTitle>
              <Brain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalSuggestions || 0}</div>
              <p className="text-xs text-gray-600">
                AI-generated replies in {performanceData?.period}
              </p>
            </CardContent>
          </Card>

          {/* Usage Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.usageRate || 0}%</div>
              <Progress value={metrics?.usageRate || 0} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">
                Suggestions adopted by agents
              </p>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.avgResponseTime || 0}ms</div>
              <p className="text-xs text-gray-600">
                AI suggestion generation time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                Feedback Analysis
              </CardTitle>
              <CardDescription>
                Agent feedback on AI suggestion quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Positive Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics?.positiveRating || 0}</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {metrics?.totalSuggestions > 0 
                        ? Math.round(((metrics?.positiveRating || 0) / metrics.totalSuggestions) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={metrics?.totalSuggestions > 0 
                    ? ((metrics?.positiveRating || 0) / metrics.totalSuggestions) * 100
                    : 0} 
                  className="h-2" 
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Negative Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metrics?.negativeRating || 0}</span>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {metrics?.totalSuggestions > 0 
                        ? Math.round(((metrics?.negativeRating || 0) / metrics.totalSuggestions) * 100)
                        : 0}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={metrics?.totalSuggestions > 0 
                    ? ((metrics?.negativeRating || 0) / metrics.totalSuggestions) * 100
                    : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Performance Insights
              </CardTitle>
              <CardDescription>
                AI system performance analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    System Status
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {performanceData?.trend === 'improving' 
                      ? "AI performance is trending upward with consistent positive feedback."
                      : "AI suggestions may need attention. Consider reviewing feedback patterns."
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Score:</span>
                      <span className="font-medium">{performanceData?.qualityScore || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage Rate:</span>
                      <span className="font-medium">{metrics?.usageRate || 0}%</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(performanceData?.qualityScore || 0) < 70 && (
                      <li>• Review negative feedback to improve suggestion quality</li>
                    )}
                    {(metrics?.usageRate || 0) < 50 && (
                      <li>• Analyze unused suggestions to enhance relevance</li>
                    )}
                    {(metrics?.avgResponseTime || 0) > 3000 && (
                      <li>• Optimize AI response time for better user experience</li>
                    )}
                    {(performanceData?.qualityScore || 0) >= 80 && (
                      <li>• Excellent performance! Continue current practices</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Improvement Actions</CardTitle>
            <CardDescription>
              Actionable steps to enhance AI performance based on current metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <Brain className="h-4 w-4" />
                  Review Feedback
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Analyze agent feedback patterns to identify improvement areas
                </p>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Optimize Models
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Fine-tune AI models based on successful suggestion patterns
                </p>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <Zap className="h-4 w-4" />
                  Performance Tuning
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Improve response times and system efficiency
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}