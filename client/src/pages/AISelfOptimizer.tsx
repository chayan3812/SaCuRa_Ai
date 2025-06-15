import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bot,
  Brain,
  Download,
  RefreshCw,
  TrendingUp,
  Zap,
  Target,
  FileText,
  BarChart3,
  Settings,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface OptimizationStats {
  totalImprovements: number;
  avgScoreGain: number;
  topFailureCategories: Array<{ category: string; count: number }>;
  totalTrainingExamples: number;
  lastProcessed: string | null;
}

interface ReplyImprovement {
  id: string;
  promptId: string;
  originalPrompt: string;
  originalReply: string;
  correctedReply: string;
  scoreGainEstimate: number;
  failureCategory: string;
  createdAt: string;
}

export default function AISelfOptimizer() {
  const { toast } = useToast();
  const [testMessage, setTestMessage] = useState("");
  const [contextPrompt, setContextPrompt] = useState("");

  // Fetch optimization statistics
  const { data: stats, isLoading: statsLoading } = useQuery<OptimizationStats>({
    queryKey: ["/api/ai/optimization-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch improvement leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<ReplyImprovement[]>({
    queryKey: ["/api/ai/improvement-leaderboard"],
    refetchInterval: 30000,
  });

  // Process failed replies mutation
  const processFailedReplies = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/process-failed-replies", {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Auto-Correction Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/optimization-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/improvement-leaderboard"] });
    },
    onError: () => {
      toast({
        title: "Processing Failed",
        description: "Unable to process failed replies",
        variant: "destructive",
      });
    },
  });

  // Export training data mutation
  const exportTrainingData = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/export-training-data", {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Training Data Exported",
        description: `${data.recordCount} training examples exported to ${data.filename}`,
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Unable to export training data",
        variant: "destructive",
      });
    },
  });

  // Force reprocessing mutation
  const forceReprocessing = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/force-reprocessing", {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Force Reprocessing Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/optimization-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/improvement-leaderboard"] });
    },
    onError: () => {
      toast({
        title: "Reprocessing Failed",
        description: "Unable to force reprocess failures",
        variant: "destructive",
      });
    },
  });

  // Generate context-aware prompt mutation
  const generateContextPrompt = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("/api/ai/generate-context-prompt", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: (data) => {
      setContextPrompt(data.contextPrompt);
      toast({
        title: "Context-Aware Prompt Generated",
        description: "Failure-aware training prompt created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate context-aware prompt",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (category: string) => {
    const colors: Record<string, string> = {
      empathy: "bg-red-100 text-red-800",
      specificity: "bg-yellow-100 text-yellow-800",
      accuracy: "bg-blue-100 text-blue-800",
      tone: "bg-green-100 text-green-800",
      completeness: "bg-purple-100 text-purple-800",
      context: "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Bot className="w-10 h-10 text-indigo-600" />
            AI Self-Optimizer - God Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Complete self-optimizing AI agent with auto-correction retraining
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Improvements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalImprovements || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Score Gain</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : `+${stats?.avgScoreGain || 0}`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Training Examples</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.totalTrainingExamples || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Processed</p>
                <p className="text-sm font-medium text-gray-900">
                  {statsLoading ? "..." : stats?.lastProcessed ? formatDate(stats.lastProcessed) : "Never"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Auto-Correction Control Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => processFailedReplies.mutate()}
              disabled={processFailedReplies.isPending}
              className="h-20 flex flex-col items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {processFailedReplies.isPending ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Play className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">
                {processFailedReplies.isPending ? "Processing..." : "Process Failed Replies"}
              </span>
            </Button>

            <Button
              onClick={() => exportTrainingData.mutate()}
              disabled={exportTrainingData.isPending}
              className="h-20 flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {exportTrainingData.isPending ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Download className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">Export Training Data</span>
            </Button>

            <Button
              onClick={() => forceReprocessing.mutate()}
              disabled={forceReprocessing.isPending}
              variant="destructive"
              className="h-20 flex flex-col items-center gap-2"
            >
              {forceReprocessing.isPending ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Zap className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">Force Reprocessing</span>
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leaderboard">Improvement Leaderboard</TabsTrigger>
            <TabsTrigger value="categories">Failure Categories</TabsTrigger>
            <TabsTrigger value="context-prompt">Context-Aware Prompts</TabsTrigger>
            <TabsTrigger value="training">Training Pipeline</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Most Improved AI Replies
              </h3>

              {leaderboardLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Score Gain</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Original Prompt</TableHead>
                        <TableHead>Improvement</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard?.slice(0, 10).map((improvement, index) => (
                        <TableRow key={improvement.id}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              +{improvement.scoreGainEstimate}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(improvement.failureCategory)}>
                              {improvement.failureCategory}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {improvement.originalPrompt}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                <strong>Before:</strong> {improvement.originalReply.substring(0, 100)}...
                              </div>
                              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                <strong>After:</strong> {improvement.correctedReply.substring(0, 100)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(improvement.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Failure Categories</h3>

              <div className="space-y-4">
                {stats?.topFailureCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium capitalize">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.count} failures</span>
                      </div>
                      <Progress 
                        value={(category.count / (stats?.totalImprovements || 1)) * 100} 
                        className="h-2"
                      />
                    </div>
                    <Badge className={getStatusColor(category.category)}>
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="context-prompt">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Failure-Aware Training Prompts
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Customer Message
                  </label>
                  <Textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter a customer service message to generate a context-aware training prompt..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => generateContextPrompt.mutate(testMessage)}
                  disabled={!testMessage.trim() || generateContextPrompt.isPending}
                  className="w-full"
                >
                  {generateContextPrompt.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Generate Context-Aware Prompt
                </Button>

                {contextPrompt && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Generated Training Prompt:</h4>
                    <pre className="whitespace-pre-wrap text-sm text-blue-800 bg-white p-3 rounded border">
                      {contextPrompt}
                    </pre>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Training Pipeline Status</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Auto-Correction</p>
                      <p className="text-sm text-green-700">Active</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">JSONL Export</p>
                      <p className="text-sm text-blue-700">Ready</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Brain className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Context Prompts</p>
                      <p className="text-sm text-purple-700">Operational</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Training Pipeline Instructions</h4>
                      <div className="mt-2 text-sm text-yellow-800 space-y-1">
                        <p>1. Process failed replies to generate improvements</p>
                        <p>2. Export training data in JSONL format for OpenAI fine-tuning</p>
                        <p>3. Use context-aware prompts for failure pattern prevention</p>
                        <p>4. Monitor leaderboard for optimization insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}