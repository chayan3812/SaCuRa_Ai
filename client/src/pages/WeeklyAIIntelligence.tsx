import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  BarChart3,
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WeeklyStats {
  topAcceptedReplies: Array<{
    reply: string;
    usageCount: number;
    successRate: number;
  }>;
  topRejectedReplies: Array<{
    reply: string;
    rejectionCount: number;
    rejectionReasons: string[];
  }>;
  confidenceDrift: {
    weekStart: number;
    weekEnd: number;
    change: number;
    trend: "improving" | "declining" | "stable";
  };
  trendingTopics: Array<{
    keyword: string;
    frequency: number;
    context: string;
  }>;
  retrainingEvents: Array<{
    date: Date;
    category: string;
    improvementsCount: number;
    description: string;
  }>;
}

interface EvolutionSummary {
  mainImprovements: string[];
  messageTypeChanges: Array<{
    messageType: string;
    beforeExample: string;
    afterExample: string;
    reason: string;
  }>;
  overallEvolution: string;
}

interface CoachingTips {
  tips: Array<{
    title: string;
    description: string;
    basedOn: string;
    priority: "high" | "medium" | "low";
  }>;
  agentPerformanceInsights: Array<{
    pattern: string;
    recommendation: string;
    impact: string;
  }>;
}

interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  stats: WeeklyStats;
  evolution: EvolutionSummary;
  coaching: CoachingTips;
  createdAt: string;
}

export default function WeeklyAIIntelligence() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Get latest weekly report
  const { data: latestReport, isLoading: reportLoading } = useQuery<WeeklyReport>({
    queryKey: ["/api/weekly-ai-reports/latest"],
    retry: false,
  });

  // Get all reports history
  const { data: reportsHistory = [], isLoading: historyLoading } = useQuery<WeeklyReport[]>({
    queryKey: ["/api/weekly-ai-reports"],
    retry: false,
  });

  // Generate new report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/weekly-ai-reports/generate", {
        method: "POST"
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Weekly Report Generated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-ai-reports/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-ai-reports"] });
    },
    onError: (error) => {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate weekly AI report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  if (reportLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly AI Intelligence</h1>
            <p className="text-muted-foreground">AI learning reports and performance evolution</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly AI Intelligence</h1>
          <p className="text-muted-foreground">
            AI learning reports, evolution summaries, and agent coaching insights
          </p>
        </div>
        <Button 
          onClick={handleGenerateReport}
          disabled={generateReportMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {generateReportMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {latestReport ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evolution">AI Evolution</TabsTrigger>
            <TabsTrigger value="coaching">Agent Coaching</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Confidence Trend</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-2xl font-bold">
                          {(latestReport.stats.confidenceDrift.change * 100).toFixed(1)}%
                        </p>
                        {getTrendIcon(latestReport.stats.confidenceDrift.trend)}
                      </div>
                    </div>
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Top Replies</p>
                      <p className="text-2xl font-bold">{latestReport.stats.topAcceptedReplies.length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Retraining Events</p>
                      <p className="text-2xl font-bold">{latestReport.stats.retrainingEvents.length}</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trending Topics</p>
                      <p className="text-2xl font-bold">{latestReport.stats.trendingTopics.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Weekly AI Summary</span>
                </CardTitle>
                <CardDescription>
                  Report period: {new Date(latestReport.weekStart).toLocaleDateString()} - {new Date(latestReport.weekEnd).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed">{latestReport.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Replies */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Top Accepted Replies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestReport.stats.topAcceptedReplies.slice(0, 5).map((reply, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <p className="text-sm font-medium mb-2">"{reply.reply}"</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Used {reply.usageCount} times
                        </span>
                        <Badge variant="secondary">
                          {(reply.successRate * 100).toFixed(0)}% success
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Top Rejected Replies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestReport.stats.topRejectedReplies.slice(0, 5).map((reply, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <p className="text-sm font-medium mb-2">"{reply.reply}"</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Rejected {reply.rejectionCount} times
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reply.rejectionReasons.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evolution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>AI Evolution Summary</span>
                </CardTitle>
                <CardDescription>How your AI assistant learned and improved this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Overall Evolution</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {latestReport.evolution.overallEvolution}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Main Improvements</h4>
                  <ul className="space-y-2">
                    {latestReport.evolution.mainImprovements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {latestReport.evolution.messageTypeChanges.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Message Type Changes</h4>
                      <div className="space-y-4">
                        {latestReport.evolution.messageTypeChanges.map((change, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{change.messageType}</span>
                            </div>
                            <div className="grid gap-2 text-sm">
                              <div>
                                <span className="text-red-600 dark:text-red-400">Before:</span> "{change.beforeExample}"
                              </div>
                              <div>
                                <span className="text-green-600 dark:text-green-400">After:</span> "{change.afterExample}"
                              </div>
                              <div className="text-muted-foreground">
                                <span className="font-medium">Reason:</span> {change.reason}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coaching" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>Agent Coaching Tips</span>
                  </CardTitle>
                  <CardDescription>AI-generated tips to improve agent performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestReport.coaching.tips.map((tip, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium">{tip.title}</h5>
                        <Badge className={getPriorityColor(tip.priority)}>
                          {tip.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                      <p className="text-xs text-muted-foreground">Based on: {tip.basedOn}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Performance Insights</span>
                  </CardTitle>
                  <CardDescription>Patterns and recommendations for agents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {latestReport.coaching.agentPerformanceInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="mb-2">
                        <h5 className="font-medium text-sm">Pattern Detected</h5>
                        <p className="text-sm text-muted-foreground">{insight.pattern}</p>
                      </div>
                      <div className="mb-2">
                        <h5 className="font-medium text-sm">Recommendation</h5>
                        <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm">Expected Impact</h5>
                        <p className="text-sm text-muted-foreground">{insight.impact}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Report History</span>
                </CardTitle>
                <CardDescription>Previous weekly AI intelligence reports</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportsHistory.map((report, index) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">
                            Week {new Date(report.weekStart).toLocaleDateString()} - {new Date(report.weekEnd).toLocaleDateString()}
                          </h5>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.summary}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                          <span>{report.stats.topAcceptedReplies.length} top replies</span>
                          <span>{report.stats.retrainingEvents.length} retraining events</span>
                          <span>{report.coaching.tips.length} coaching tips</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Weekly Reports Available</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first weekly AI intelligence report to see insights, evolution summaries, and coaching tips.
            </p>
            <Button onClick={handleGenerateReport} disabled={generateReportMutation.isPending}>
              {generateReportMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate First Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}