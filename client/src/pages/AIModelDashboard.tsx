import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Brain, TestTube, Edit, CheckCircle, XCircle } from "lucide-react";

interface ABTestResults {
  testRunning: boolean;
  baseModel: {
    name: string;
    successRate: number;
    avgConfidence: number;
    avgResponseTime: number;
  };
  testModel: {
    name: string;
    successRate: number;
    avgConfidence: number;
    avgResponseTime: number;
  };
  statisticalSignificance: boolean;
  recommendation: "continue_test" | "deploy_v2.1" | "rollback_to_base";
  sampleSize: { base: number; test: number };
}

interface ConfidenceDrift {
  date: string;
  avgConfidence: number;
  replyCount: number;
  drift: number;
}

interface DriftMetrics {
  dailyDrift: ConfidenceDrift[];
  overallTrend: "improving" | "declining" | "stable";
  alertThreshold: number;
  currentAlert: boolean;
  recommendations: string[];
}

interface PerformanceDrops {
  performanceDrops: Array<{
    startDate: string;
    endDate: string;
    dropPercentage: number;
    affectedReplies: number;
    avgConfidence: number;
  }>;
  autoTrainingRecommended: boolean;
  trainingDataCount: number;
}

export default function AIModelDashboard() {
  const [agentDraft, setAgentDraft] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const queryClient = useQueryClient();

  // A/B Test Results
  const { data: abTestResults, isLoading: abTestLoading } = useQuery<ABTestResults>({
    queryKey: ["/api/ai/ab-test/results"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Confidence Drift Metrics
  const { data: driftMetrics, isLoading: driftLoading } = useQuery<DriftMetrics>({
    queryKey: ["/api/ai/confidence-drift"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Performance Drops Analysis
  const { data: performanceDrops, isLoading: dropsLoading } = useQuery<PerformanceDrops>({
    queryKey: ["/api/ai/performance-drops"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Agent Co-Pilot Improvement
  const improveDraftMutation = useMutation({
    mutationFn: async (draft: string) => {
      const response = await fetch('/api/ai/improve-agent-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentDraft: draft }),
      });
      if (!response.ok) throw new Error('Failed to improve draft');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai"] });
    },
  });

  // A/B Test Reply Generation
  const generateReplyMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai/ab-test/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: "Dashboard test" }),
      });
      if (!response.ok) throw new Error('Failed to generate reply');
      return response.json();
    },
  });

  // Generate Training Data from Drops
  const generateTrainingMutation = useMutation({
    mutationFn: async (dropPeriods: any[]) => {
      const response = await fetch('/api/ai/generate-training-from-drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropPeriods }),
      });
      if (!response.ok) throw new Error('Failed to generate training data');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/performance-drops"] });
    },
  });

  const handleImproveDraft = () => {
    if (agentDraft.trim()) {
      improveDraftMutation.mutate(agentDraft);
    }
  };

  const handleGenerateReply = () => {
    if (testMessage.trim()) {
      generateReplyMutation.mutate(testMessage);
    }
  };

  const handleGenerateTraining = () => {
    if (performanceDrops?.performanceDrops) {
      const dropPeriods = performanceDrops.performanceDrops.map(drop => ({
        startDate: new Date(drop.startDate),
        endDate: new Date(drop.endDate)
      }));
      generateTrainingMutation.mutate(dropPeriods);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "deploy_v2.1":
        return "bg-green-100 text-green-800 border-green-200";
      case "rollback_to_base":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Model Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor A/B testing, confidence drift, and optimize AI performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <Badge variant="outline">Live Monitoring</Badge>
        </div>
      </div>

      <Tabs defaultValue="ab-testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="confidence-drift">Confidence Drift</TabsTrigger>
          <TabsTrigger value="performance-drops">Performance Drops</TabsTrigger>
          <TabsTrigger value="agent-copilot">Agent Co-Pilot</TabsTrigger>
        </TabsList>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-testing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Test Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Status</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {abTestResults?.testRunning ? "Running" : "Stopped"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {abTestResults?.statisticalSignificance ? "Statistically significant" : "Need more data"}
                </p>
              </CardContent>
            </Card>

            {/* Base Model Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Base Model (GPT-4o)</CardTitle>
                <Badge variant="secondary">Control</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((abTestResults?.baseModel.successRate || 0) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Success Rate • {abTestResults?.sampleSize.base || 0} samples
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Confidence:</span>
                    <span>{Math.round((abTestResults?.baseModel.avgConfidence || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Avg Response:</span>
                    <span>{abTestResults?.baseModel.avgResponseTime || 0}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Model Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Model (v2.1)</CardTitle>
                <Badge variant="outline">Test</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((abTestResults?.testModel.successRate || 0) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Success Rate • {abTestResults?.sampleSize.test || 0} samples
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Confidence:</span>
                    <span>{Math.round((abTestResults?.testModel.avgConfidence || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Avg Response:</span>
                    <span>{abTestResults?.testModel.avgResponseTime || 0}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation Alert */}
          {abTestResults?.recommendation && (
            <Alert className={getRecommendationColor(abTestResults.recommendation)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendation:</strong> {
                  abTestResults.recommendation === "deploy_v2.1" ? "Deploy fine-tuned model v2.1 - showing superior performance" :
                  abTestResults.recommendation === "rollback_to_base" ? "Rollback to base model - test model underperforming" :
                  "Continue A/B testing - need more data for statistical significance"
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Test Message Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Test Message Generator</CardTitle>
              <CardDescription>
                Generate replies using A/B testing to compare model performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Message</label>
                <Textarea
                  placeholder="Enter a customer message to test both models..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleGenerateReply}
                disabled={!testMessage.trim() || generateReplyMutation.isPending}
                className="w-full"
              >
                {generateReplyMutation.isPending ? "Generating..." : "Generate A/B Test Reply"}
              </Button>
              
              {generateReplyMutation.data && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Model Used:</span>
                      <Badge variant="outline">{generateReplyMutation.data.version}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence:</span>
                      <span className="text-sm">{Math.round(generateReplyMutation.data.confidenceScore * 100)}%</span>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium">Reply:</span>
                      <p className="text-sm mt-1">{generateReplyMutation.data.reply}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence Drift Tab */}
        <TabsContent value="confidence-drift" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Trend</CardTitle>
                {getTrendIcon(driftMetrics?.overallTrend || "stable")}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {driftMetrics?.overallTrend || "Stable"}
                </div>
                <p className="text-xs text-muted-foreground">
                  30-day trend analysis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alert Status</CardTitle>
                {driftMetrics?.currentAlert ? 
                  <XCircle className="h-4 w-4 text-red-500" /> : 
                  <CheckCircle className="h-4 w-4 text-green-500" />
                }
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {driftMetrics?.currentAlert ? "Alert" : "Normal"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Threshold: {Math.round((driftMetrics?.alertThreshold || 0.2) * 100)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {driftMetrics?.dailyDrift?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days of data collected
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Confidence Drift Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Confidence Drift</CardTitle>
              <CardDescription>
                Track how AI confidence scores change over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={driftMetrics?.dailyDrift || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgConfidence" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Avg Confidence"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="drift" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Drift"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {driftMetrics?.recommendations?.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Drops Tab */}
        <TabsContent value="performance-drops" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Detected Drops</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceDrops?.performanceDrops?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  In the last 4 weeks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Training</CardTitle>
                <Brain className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceDrops?.autoTrainingRecommended ? "Ready" : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceDrops?.trainingDataCount || 0} data points available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGenerateTraining}
                  disabled={!performanceDrops?.autoTrainingRecommended || generateTrainingMutation.isPending}
                  size="sm"
                  className="w-full"
                >
                  {generateTrainingMutation.isPending ? "Generating..." : "Generate Training Data"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Drops List */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Drop Events</CardTitle>
              <CardDescription>
                Periods where AI performance dropped significantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceDrops?.performanceDrops?.map((drop, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {new Date(drop.startDate).toLocaleDateString()} - {new Date(drop.endDate).toLocaleDateString()}
                      </span>
                      <Badge variant={drop.dropPercentage > 30 ? "destructive" : "secondary"}>
                        -{drop.dropPercentage}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Affected Replies:</span> {drop.affectedReplies}
                      </div>
                      <div>
                        <span className="font-medium">Avg Confidence:</span> {Math.round(drop.avgConfidence * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!performanceDrops?.performanceDrops || performanceDrops.performanceDrops.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No significant performance drops detected in the last 4 weeks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {generateTrainingMutation.data && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Training data generated successfully: {generateTrainingMutation.data.trainingExamples} examples 
                (Quality Score: {Math.round(generateTrainingMutation.data.qualityScore * 100)}%)
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Agent Co-Pilot Tab */}
        <TabsContent value="agent-copilot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Agent Co-Pilot</span>
              </CardTitle>
              <CardDescription>
                AI-powered draft improvement for customer service agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Agent Draft</label>
                <Textarea
                  placeholder="Paste your draft customer response here..."
                  value={agentDraft}
                  onChange={(e) => setAgentDraft(e.target.value)}
                  className="mt-1 min-h-32"
                />
              </div>
              
              <Button 
                onClick={handleImproveDraft}
                disabled={!agentDraft.trim() || improveDraftMutation.isPending}
                className="w-full"
              >
                {improveDraftMutation.isPending ? "Improving..." : "Improve with AI"}
              </Button>

              {improveDraftMutation.data && (
                <div className="space-y-4">
                  <Separator />
                  
                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Original Draft</h4>
                      <div className="p-3 bg-gray-50 rounded-lg min-h-24">
                        <p className="text-sm">{improveDraftMutation.data.originalDraft}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center justify-between">
                        <span>AI Suggestion</span>
                        <Badge variant="outline">
                          {Math.round(improveDraftMutation.data.confidenceScore * 100)}% confidence
                        </Badge>
                      </h4>
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 min-h-24">
                        <p className="text-sm">{improveDraftMutation.data.aiSuggestion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Improvements made */}
                  <div>
                    <h4 className="font-medium mb-2">Improvements Made</h4>
                    <div className="space-y-2">
                      {improveDraftMutation.data.improvements?.map((improvement: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}