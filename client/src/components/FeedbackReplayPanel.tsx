import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  User,
  Bot,
  UserCheck,
  CheckCircle,
  XCircle,
  Brain,
  ArrowRight,
  Zap,
  Eye,
  RotateCcw
} from "lucide-react";

interface CustomerInteraction {
  id: string;
  message: string;
  aiReply: string;
  agentReply?: string;
  correctedReply?: string;
  feedback?: string;
  timestamp: string;
  assistantVersion?: string;
}

interface FeedbackReplayPanelProps {
  interaction: CustomerInteraction;
  onUpdate?: () => void;
}

export default function FeedbackReplayPanel({ interaction, onUpdate }: FeedbackReplayPanelProps) {
  const { toast } = useToast();
  const [manualCorrection, setManualCorrection] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  // Generate improved reply mutation
  const generateImprovedReply = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/generate-improved-reply", {
        method: "POST",
        body: JSON.stringify({
          interactionId: interaction.id,
          originalMessage: interaction.message,
          aiReply: interaction.aiReply,
          agentReply: interaction.agentReply || "",
          feedback: interaction.feedback || "no"
        }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Improved Reply Generated",
        description: "AI has created an enhanced version of the original response",
      });
      onUpdate?.();
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate improved reply",
        variant: "destructive",
      });
    },
  });

  // Submit manual correction mutation
  const submitManualCorrection = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/submit-manual-correction", {
        method: "POST",
        body: JSON.stringify({
          interactionId: interaction.id,
          correctedReply: manualCorrection,
          originalAiReply: interaction.aiReply,
          customerMessage: interaction.message
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Manual Correction Submitted",
        description: "Your correction has been added to the training data",
      });
      setManualCorrection("");
      onUpdate?.();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit manual correction",
        variant: "destructive",
      });
    },
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getReplyQuality = (reply: string) => {
    // Simple heuristic for reply quality
    if (reply.length < 20) return { level: "poor", color: "red" };
    if (reply.length < 50) return { level: "fair", color: "yellow" };
    if (reply.length > 100) return { level: "excellent", color: "green" };
    return { level: "good", color: "blue" };
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI vs Agent Feedback Replay
          </h3>
          <div className="flex items-center gap-2">
            {interaction.assistantVersion && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {interaction.assistantVersion}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {formatTimestamp(interaction.timestamp)}
            </Badge>
          </div>
        </div>

        {/* Customer Message */}
        <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">Customer Message</span>
          </div>
          <p className="text-gray-800 leading-relaxed">{interaction.message}</p>
        </div>

        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
            <TabsTrigger value="improvement">AI Improvement</TabsTrigger>
            <TabsTrigger value="manual">Manual Correction</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Reply */}
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-900">AI Reply</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`bg-${getReplyQuality(interaction.aiReply).color}-100 text-${getReplyQuality(interaction.aiReply).color}-800`}
                  >
                    {getReplyQuality(interaction.aiReply).level}
                  </Badge>
                </div>
                <p className="text-red-800 leading-relaxed">{interaction.aiReply}</p>
                {interaction.feedback === "no" && (
                  <div className="mt-2 flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Marked as Not Helpful</span>
                  </div>
                )}
              </div>

              {/* Agent Reply */}
              {interaction.agentReply && (
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Agent Reply</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`bg-${getReplyQuality(interaction.agentReply).color}-100 text-${getReplyQuality(interaction.agentReply).color}-800`}
                    >
                      {getReplyQuality(interaction.agentReply).level}
                    </Badge>
                  </div>
                  <p className="text-green-800 leading-relaxed">{interaction.agentReply}</p>
                  <div className="mt-2 flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Human-Verified Response</span>
                  </div>
                </div>
              )}
            </div>

            {/* Improvement Arrow */}
            {interaction.agentReply && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm font-medium">Learning Opportunity</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="improvement" className="space-y-4">
            <div className="text-center">
              <Button
                onClick={() => generateImprovedReply.mutate()}
                disabled={generateImprovedReply.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                {generateImprovedReply.isPending ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 mr-2" />
                )}
                Generate AI Improved Reply
              </Button>
            </div>

            {interaction.correctedReply && (
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Improved Reply</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Auto-Generated
                  </Badge>
                </div>
                <p className="text-blue-800 leading-relaxed">{interaction.correctedReply}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manual Correction
                </label>
                <Textarea
                  value={manualCorrection}
                  onChange={(e) => setManualCorrection(e.target.value)}
                  placeholder="Provide a corrected version of the AI reply..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <Button
                onClick={() => submitManualCorrection.mutate()}
                disabled={!manualCorrection.trim() || submitManualCorrection.isPending}
                className="w-full"
              >
                {submitManualCorrection.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Submit Manual Correction
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4" />
            <span>Interaction ID: {interaction.id.substring(0, 8)}...</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? "Hide" : "Show"} Analysis
            </Button>
          </div>
        </div>

        {/* Analysis Panel */}
        {showComparison && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">Improvement Analysis</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• AI reply length: {interaction.aiReply.length} characters</p>
              <p>• Agent reply length: {interaction.agentReply?.length || 0} characters</p>
              <p>• Feedback status: {interaction.feedback === "no" ? "Negative" : "Positive"}</p>
              <p>• Training potential: {interaction.agentReply ? "High" : "Medium"}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}