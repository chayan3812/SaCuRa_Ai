import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle,
  Brain
} from "lucide-react";

interface FeedbackReplayToolProps {
  message: string;
  aiReply: string;
  onSubmit?: () => void;
  className?: string;
}

export default function FeedbackReplayTool({ 
  message, 
  aiReply, 
  onSubmit,
  className 
}: FeedbackReplayToolProps) {
  const [agentReply, setAgentReply] = useState("");
  const [feedback, setFeedback] = useState<"yes" | "no" | "">("");
  const [improvementNotes, setImprovementNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitReplayMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      aiReply: string;
      agentReply: string;
      feedback: string;
      improvementNotes: string;
      sessionId: string;
    }) => {
      return await apiRequest('/api/feedback-replay', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "AI vs Agent comparison stored for training pipeline",
      });
      
      // Reset form
      setAgentReply("");
      setFeedback("");
      setImprovementNotes("");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/analytics'] });
      
      onSubmit?.();
    },
    onError: (error) => {
      console.error('Feedback replay submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback replay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!feedback) {
      toast({
        title: "Feedback Required",
        description: "Please select whether the AI reply was useful or not",
        variant: "destructive",
      });
      return;
    }

    if (feedback === "no" && !agentReply.trim()) {
      toast({
        title: "Agent Reply Required",
        description: "Please provide a better response for training the AI",
        variant: "destructive",
      });
      return;
    }

    const sessionId = `session_${Date.now()}`;
    
    submitReplayMutation.mutate({
      message,
      aiReply,
      agentReply,
      feedback,
      improvementNotes,
      sessionId,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI vs Agent Feedback Replay
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Compare AI suggestions with agent responses to improve model performance
        </p>
      </div>

      {/* Customer Message */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Customer Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border-l-4 border-blue-600">
            <p className="text-sm">{message}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI vs Agent Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Suggested Reply */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-purple-600" />
              AI Suggested Reply
            </CardTitle>
            <CardDescription>
              Generated response from the AI model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded border-l-4 border-purple-600">
              <p className="text-sm">{aiReply}</p>
            </div>
          </CardContent>
        </Card>

        {/* Agent Final Reply */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-green-600" />
              Agent Final Reply
            </CardTitle>
            <CardDescription>
              Your actual response to the customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter the response you actually sent to the customer..."
              value={agentReply}
              onChange={(e) => setAgentReply(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feedback & Training</CardTitle>
          <CardDescription>
            Help improve the AI by rating its performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feedback Radio Buttons */}
          <div>
            <Label className="text-sm font-medium">Was the AI reply useful?</Label>
            <RadioGroup
              value={feedback}
              onValueChange={(value) => setFeedback(value as "yes" | "no")}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="feedback-yes" />
                <Label htmlFor="feedback-yes" className="flex items-center gap-2 cursor-pointer">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Yes, helpful
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="feedback-no" />
                <Label htmlFor="feedback-no" className="flex items-center gap-2 cursor-pointer">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  No, needs improvement
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Improvement Notes */}
          <div>
            <Label htmlFor="improvement-notes" className="text-sm font-medium">
              Improvement Notes (Optional)
            </Label>
            <Textarea
              id="improvement-notes"
              placeholder="What could the AI have done better? Any specific suggestions for improvement..."
              value={improvementNotes}
              onChange={(e) => setImprovementNotes(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Training Pipeline Info */}
          {feedback === "no" && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Training Pipeline Activated
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This feedback will be automatically added to the training pipeline to improve AI responses. 
                    Your agent reply will be used as the preferred completion for similar messages.
                  </p>
                </div>
              </div>
            </div>
          )}

          {feedback === "yes" && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Positive Reinforcement
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    This positive feedback helps reinforce successful AI patterns for similar customer messages.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={submitReplayMutation.isPending || !feedback}
          className="px-8"
        >
          {submitReplayMutation.isPending ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>

      {/* Training Status */}
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          <Brain className="h-3 w-3 mr-1" />
          GPT Ops Mode: AI Training Pipeline Active
        </Badge>
      </div>
    </div>
  );
}