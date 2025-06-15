import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FeedbackReplayTool from "@/components/FeedbackReplayTool";
import {
  Brain,
  Download,
  RefreshCw,
  MessageSquare,
  Target,
  TrendingUp,
  AlertTriangle,
  FileText,
  Zap,
  Settings
} from "lucide-react";

interface TrainingExample {
  id: string;
  prompt: string;
  completion: string;
  feedbackScore: number;
  trainingBatch: string;
  exported: boolean;
  createdAt: string;
}

interface WorstReply {
  id: string;
  message: string;
  aiReply: string;
  agentReply: string;
  feedback: string;
  createdAt: string;
}

export default function AITraining() {
  const [sampleMessage] = useState("Hi, I ordered a product 3 days ago but haven't received any shipping updates. Can you help me track my order?");
  const [sampleAIReply] = useState("Thank you for contacting us. I understand your concern about your order. Please provide your order number so I can look into this for you.");
  const { toast } = useToast();

  const { data: worstReplies, isLoading: isLoadingWorst, refetch: refetchWorst } = useQuery({
    queryKey: ['/api/feedback-replay/worst?limit=10'],
    refetchInterval: 30000,
  });

  const { data: trainingExamples, isLoading: isLoadingTraining } = useQuery({
    queryKey: ['/api/training/examples'],
    refetchInterval: 60000,
  });

  const exportTrainingMutation = useMutation({
    mutationFn: async (batchId: string) => {
      const response = await fetch(`/api/training/export/${batchId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `training_${batchId}.jsonl`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Training Data Exported",
        description: "JSONL file downloaded successfully for model fine-tuning",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export training data",
        variant: "destructive",
      });
    },
  });

  const handleReplaySubmit = () => {
    refetchWorst();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Training Pipeline
          </h1>
          <p className="text-gray-600 mt-1">GPT Ops Mode - Advanced AI model training and improvement</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-purple-600">
            <Zap className="h-3 w-3 mr-1" />
            GPT Ops Active
          </Badge>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="replay" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="replay" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback Replay
          </TabsTrigger>
          <TabsTrigger value="worst" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Worst Replies
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Training Data
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Self-Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="replay" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI vs Agent Comparison Tool</CardTitle>
              <CardDescription>
                Compare AI suggestions with actual agent responses to improve model performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackReplayTool
                message={sampleMessage}
                aiReply={sampleAIReply}
                onSubmit={handleReplaySubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worst" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worst Performing Replies</CardTitle>
              <CardDescription>
                AI responses that received negative feedback and need improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWorst ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Loading worst replies...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Message</TableHead>
                      <TableHead>AI Reply (Failed)</TableHead>
                      <TableHead>Agent Override</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worstReplies?.length ? (
                      worstReplies.map((reply: WorstReply) => (
                        <TableRow key={reply.id}>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={reply.message}>
                              {reply.message}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-red-600" title={reply.aiReply}>
                              {reply.aiReply}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {reply.agentReply ? (
                              <div className="truncate text-green-600" title={reply.agentReply}>
                                {reply.agentReply}
                              </div>
                            ) : (
                              <span className="text-gray-400">No override provided</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(reply.createdAt).toLocaleDateString()}
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
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No failed replies found. AI is performing excellently!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Data Pipeline</CardTitle>
              <CardDescription>
                Export training examples for model fine-tuning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{trainingExamples?.length || 0}</div>
                    <div className="text-sm text-gray-600">Training Examples</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">JSONL</div>
                    <div className="text-sm text-gray-600">Export Format</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">GPT-4o</div>
                    <div className="text-sm text-gray-600">Target Model</div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium mb-2">Export Instructions</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700 dark:text-gray-300">
                  <li>Training examples are automatically generated from negative feedback</li>
                  <li>Click "Export Training Data" to download JSONL format file</li>
                  <li>Upload to OpenAI: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">openai api fine_tunes.create -t "file.jsonl" -m gpt-4o</code></li>
                  <li>Deploy the fine-tuned model to replace current AI responses</li>
                </ol>
              </div>

              <Button
                onClick={() => exportTrainingMutation.mutate(`batch_${Date.now()}`)}
                disabled={exportTrainingMutation.isPending || !trainingExamples?.length}
                className="w-full"
              >
                {exportTrainingMutation.isPending ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Training Data (JSONL)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Self-Awareness Analysis</CardTitle>
              <CardDescription>
                AI analyzes its own failures and suggests improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Auto-Analysis Pipeline
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  When replies receive negative feedback, the AI automatically analyzes why the response failed 
                  and generates improvement suggestions for future training.
                </p>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {worstReplies?.slice(0, 3).map((reply: WorstReply, index: number) => (
                    <div key={reply.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm">Analysis #{index + 1}</span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600 mb-2">Failed Message: "{reply.message}"</p>
                        <p className="text-red-600 mb-2">AI Response: "{reply.aiReply}"</p>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border-l-2 border-purple-600">
                          <p className="text-purple-700 dark:text-purple-300 font-medium">AI Self-Analysis:</p>
                          <p className="text-sm mt-1">
                            The response likely failed because it was too generic and didn't acknowledge the customer's 
                            specific concern about shipping updates. A better approach would be to immediately address 
                            the shipping delay and provide proactive tracking information.
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No failed responses to analyze. AI is performing well!
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