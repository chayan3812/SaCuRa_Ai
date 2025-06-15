import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Brain, TestTube, CheckCircle, AlertCircle, TrendingUp, Activity } from "lucide-react";

export default function AITestDashboard() {
  const [testMessage, setTestMessage] = useState("My payment failed three times and I'm really frustrated. What's going on?");
  const [aiReply, setAiReply] = useState("Thank you for contacting us. We'll look into it.");
  const [agentReply, setAgentReply] = useState("I understand your frustration with the payment failures. Let me check your account immediately and resolve this for you. I can see the issue - your bank is blocking the transaction. I'll provide you with alternative payment methods right now.");
  const [feedback, setFeedback] = useState<"yes" | "no">("no");
  const [improvementNotes, setImprovementNotes] = useState("AI response was too generic and didn't address the specific payment issue or show empathy");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Submit feedback replay test
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      aiReply: string;
      agentReply: string;
      feedback: string;
      improvementNotes: string;
      sessionId: string;
    }) => {
      return await apiRequest('/api/feedback/replay', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "AI self-awareness analysis has been triggered for this failed reply.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/failure-insights'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get failure insights
  const { data: failureInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai/failure-insights'],
    retry: false,
  });

  // Get failure explanations
  const { data: explanations, isLoading: explanationsLoading } = useQuery({
    queryKey: ['/api/ai/failure-explanations'],
    retry: false,
  });

  const handleSubmitTest = () => {
    submitFeedbackMutation.mutate({
      message: testMessage,
      aiReply,
      agentReply,
      feedback,
      improvementNotes,
      sessionId: `test-session-${Date.now()}`
    });
  };

  const runFailureAnalysis = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/analyze-failure', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: testMessage,
          aiReply,
          agentReply,
          feedback
        }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: data.analyzed ? "AI failure explanation generated" : "No analysis needed for positive feedback",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Self-Awareness Test Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test the complete GPT Ops Mode with failure analysis and self-improvement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Feedback Replay */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-600" />
                Test Feedback Replay System
              </CardTitle>
              <CardDescription>
                Submit a test case to trigger AI self-awareness analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message">Customer Message</Label>
                <Textarea
                  id="message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ai-reply">AI Suggested Reply</Label>
                <Textarea
                  id="ai-reply"
                  value={aiReply}
                  onChange={(e) => setAiReply(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="agent-reply">Agent's Actual Reply</Label>
                <Textarea
                  id="agent-reply"
                  value={agentReply}
                  onChange={(e) => setAgentReply(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Feedback</Label>
                <RadioGroup value={feedback} onValueChange={(value: "yes" | "no") => setFeedback(value)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Useful</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">Not Useful (Triggers Analysis)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="notes">Improvement Notes</Label>
                <Textarea
                  id="notes"
                  value={improvementNotes}
                  onChange={(e) => setImprovementNotes(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitTest}
                  disabled={submitFeedbackMutation.isPending}
                  className="flex-1"
                >
                  {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Test Feedback"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => runFailureAnalysis.mutate()}
                  disabled={runFailureAnalysis.isPending}
                >
                  {runFailureAnalysis.isPending ? "Analyzing..." : "Run Analysis"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Self-Awareness Status */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Self-Awareness Status
              </CardTitle>
              <CardDescription>
                Real-time insights from failure analysis system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading ? (
                <div className="text-center py-4">Loading insights...</div>
              ) : failureInsights ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Failures:</span>
                    <Badge variant="destructive">{failureInsights.totalFailures}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recent Failures:</span>
                    <Badge variant="secondary">{failureInsights.recentFailures?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pattern Analysis:</span>
                    <Badge variant="outline">{failureInsights.commonFailurePatterns?.length || 0} patterns</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No failure insights available yet
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AI Self-Awareness: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Learning Pipeline: Running</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Training Data: Generating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Failure Explanations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Recent AI Failure Explanations
            </CardTitle>
            <CardDescription>
              Self-generated analysis of why AI responses failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {explanationsLoading ? (
              <div className="text-center py-8">Loading explanations...</div>
            ) : explanations && explanations.length > 0 ? (
              <div className="space-y-4">
                {explanations.slice(0, 5).map((explanation: any, index: number) => (
                  <div key={explanation.id} className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-900/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Customer Message
                        </h4>
                        <p className="text-sm bg-white dark:bg-gray-800 p-2 rounded">
                          {explanation.message.substring(0, 100)}...
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Failed AI Reply
                        </h4>
                        <p className="text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {explanation.aiReply.substring(0, 80)}...
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">
                          AI Self-Analysis
                        </h4>
                        <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          {explanation.explanation?.substring(0, 120)}...
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Generated: {new Date(explanation.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No failure explanations generated yet. Submit a test case above to see AI self-analysis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {(submitFeedbackMutation.isSuccess || runFailureAnalysis.isSuccess) && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {submitFeedbackMutation.isSuccess && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Feedback replay submitted successfully</span>
                  </div>
                )}
                {feedback === "no" && (
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">AI self-awareness analysis triggered for failed reply</span>
                  </div>
                )}
                {runFailureAnalysis.isSuccess && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Direct failure analysis completed</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}