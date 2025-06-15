import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  GitCompare, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  ThumbsUp,
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface PromptComparison {
  id: string;
  promptId: string;
  oldPrompt: string;
  newPrompt: string;
  deltaReason: string;
  improvementScore: number;
  testResults: {
    oldAccuracy: number;
    newAccuracy: number;
    improvement: number;
  };
  timestamp: Date;
  status: 'pending' | 'approved' | 'reverted';
  category: string;
}

interface TrainingHistory {
  id: string;
  trainingType: string;
  completedAt: Date;
  accuracy: number;
  improvement: number;
  samplesUsed: number;
  category: string;
}

export default function AdminAIDigest() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("comparisons");

  const { data: promptComparisons, isLoading: loadingComparisons, refetch: refetchComparisons } = useQuery({
    queryKey: ['/api/admin/prompt-comparisons'],
    queryFn: () => apiRequest('/api/admin/prompt-comparisons'),
  });

  const { data: trainingHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['/api/admin/training-history'],
    queryFn: () => apiRequest('/api/admin/training-history'),
  });

  const updatePromptMutation = useMutation({
    mutationFn: async ({ promptId, action }: { promptId: string; action: 'approve' | 'revert' }) => {
      return apiRequest(`/api/admin/prompt-status`, {
        method: 'POST',
        body: JSON.stringify({ promptId, action }),
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: `Prompt ${variables.action === 'approve' ? 'Approved' : 'Reverted'}`,
        description: `The prompt has been ${variables.action === 'approve' ? 'approved and deployed' : 'reverted to previous version'}.`,
      });
      refetchComparisons();
    },
    onError: (error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testComparisonMutation = useMutation({
    mutationFn: async (promptId: string) => {
      return apiRequest(`/api/admin/test-prompt-comparison`, {
        method: 'POST',
        body: JSON.stringify({ promptId }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Comparison Test Started",
        description: "Running side-by-side test of old vs new prompt. Results will update automatically.",
      });
      refetchComparisons();
    },
  });

  const getImprovementColor = (improvement: number) => {
    if (improvement > 0.1) return "text-green-600 dark:text-green-400";
    if (improvement > 0) return "text-blue-600 dark:text-blue-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'reverted':
        return <Badge variant="destructive">Reverted</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Digest & Training Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor prompt evolution and training performance across all AI models
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Brain className="w-4 h-4 mr-1" />
            Neural Evolution
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparisons">Prompt Comparisons</TabsTrigger>
          <TabsTrigger value="history">Training History</TabsTrigger>
        </TabsList>

        <TabsContent value="comparisons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5" />
                <span>Before / After Prompt Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingComparisons ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Loading prompt comparisons...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {promptComparisons?.map((comparison: PromptComparison) => (
                    <div key={comparison.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {comparison.category}
                          </Badge>
                          {getStatusBadge(comparison.status)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(comparison.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testComparisonMutation.mutate(comparison.promptId)}
                            disabled={testComparisonMutation.isPending}
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Test Side-by-Side
                          </Button>
                          {comparison.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updatePromptMutation.mutate({ 
                                  promptId: comparison.promptId, 
                                  action: 'approve' 
                                })}
                                disabled={updatePromptMutation.isPending}
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePromptMutation.mutate({ 
                                  promptId: comparison.promptId, 
                                  action: 'revert' 
                                })}
                                disabled={updatePromptMutation.isPending}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Revert
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            <h4 className="font-medium text-red-700 dark:text-red-400">
                              Before (Old Prompt)
                            </h4>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {comparison.oldPrompt}
                            </p>
                          </div>
                          {comparison.testResults && (
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded">
                              <p className="text-xs font-medium text-red-800 dark:text-red-300">
                                Accuracy: {(comparison.testResults.oldAccuracy * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <h4 className="font-medium text-green-700 dark:text-green-400">
                              After (New Prompt)
                            </h4>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {comparison.newPrompt}
                            </p>
                          </div>
                          {comparison.testResults && (
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
                              <p className="text-xs font-medium text-green-800 dark:text-green-300">
                                Accuracy: {(comparison.testResults.newAccuracy * 100).toFixed(1)}%
                              </p>
                              <p className={`text-xs font-medium ${getImprovementColor(comparison.testResults.improvement)}`}>
                                Improvement: {comparison.testResults.improvement > 0 ? '+' : ''}{(comparison.testResults.improvement * 100).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                          GPT Analysis of Improvement:
                        </h5>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          {comparison.deltaReason}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!promptComparisons || promptComparisons.length === 0) && (
                    <div className="text-center py-8">
                      <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Prompt Comparisons Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Prompt comparisons will appear here when the AI system generates improved prompts through training.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Training Performance History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Loading training history...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainingHistory?.map((training: TrainingHistory) => (
                    <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {training.category}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {training.trainingType}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(training.completedAt).toLocaleString()} • {training.samplesUsed} samples
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Accuracy: {(training.accuracy * 100).toFixed(1)}%
                        </p>
                        <p className={`text-sm font-medium ${getImprovementColor(training.improvement)}`}>
                          {training.improvement > 0 ? '+' : ''}{(training.improvement * 100).toFixed(1)}% improvement
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!trainingHistory || trainingHistory.length === 0) && (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Training History Available
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Training history will be logged here as the AI system learns and improves.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}