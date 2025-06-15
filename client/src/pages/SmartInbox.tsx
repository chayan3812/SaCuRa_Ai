import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Bot, 
  AlertTriangle, 
  Clock, 
  User,
  Send,
  Zap,
  Brain,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Copy,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { SmartReplyFeedback } from "@/components/SmartReplyFeedback";

interface CustomerInteraction {
  id: string;
  pageId: string;
  customerId?: string;
  customerName?: string;
  message: string;
  response?: string;
  respondedBy?: string;
  responseTime?: number;
  sentiment?: string;
  status: string;
  isAutoResponse: boolean;
  createdAt: string;
  updatedAt: string;
  urgencyScore?: string;
  aiClassification?: string;
  aiSuggestedReplies?: string[];
  aiAnalyzedAt?: string;
  agentSuggestedReply?: string;
  agentReplyUsed?: boolean;
  agentReplyFeedback?: string;
}

interface AIAnalysis {
  messageId: string;
  classification: string;
  urgencyScore: number;
  replySuggestions: string[];
  analyzedAt: string;
}

interface AgentSuggestion {
  messageId: string;
  suggestedReply: string;
  customerName?: string;
  originalMessage: string;
  generatedAt: string;
}

export default function SmartInbox() {
  const [selectedMessage, setSelectedMessage] = useState<CustomerInteraction | null>(null);
  const [replyText, setReplyText] = useState("");
  const [suggestionStartTime, setSuggestionStartTime] = useState<number | null>(null);
  const [agentSuggestion, setAgentSuggestion] = useState<AgentSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interactions = [], isLoading } = useQuery<CustomerInteraction[]>({
    queryKey: ["/api/customer-service/interactions/all"],
  });

  const analyzeMessageMutation = useMutation({
    mutationFn: async (messageId: string): Promise<AIAnalysis> => {
      return await apiRequest("/api/messages/analyze", {
        method: 'POST',
        body: JSON.stringify({ messageId })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-service/interactions/all"] });
      toast({
        title: "AI Analysis Complete",
        description: `Message classified as ${data.classification} with ${data.urgencyScore}% urgency`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze message with AI",
        variant: "destructive",
      });
    },
  });

  // AgentAssistChat - GPT-powered reply suggestions
  const suggestReplyMutation = useMutation({
    mutationFn: async (messageId: string): Promise<AgentSuggestion> => {
      setSuggestionStartTime(Date.now());
      return await apiRequest(`/api/agent-suggest-reply/${messageId}`, {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data) => {
      setAgentSuggestion(data);
      toast({
        title: "AI Reply Generated",
        description: "GPT has suggested a reply for this message",
      });
    },
    onError: (error) => {
      toast({
        title: "Suggestion Failed",
        description: "Could not generate reply suggestion",
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: { messageId: string; used: boolean; feedback?: string }) => {
      return await apiRequest("/api/agent-reply-feedback", {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-service/interactions/all"] });
    },
  });

  // SmartFeedback - Track AI suggestion quality for self-improvement
  const trackSmartFeedback = useMutation({
    mutationFn: async (data: { 
      messageId: string; 
      aiSuggestion: string; 
      feedback: 'useful' | 'not_useful'; 
      responseTime?: number 
    }) => {
      return await apiRequest('/api/feedback/submit', {
        method: 'POST',
        body: JSON.stringify({
          messageId: data.messageId,
          aiSuggestion: data.aiSuggestion,
          feedback: data.feedback === 'useful',
          platformContext: 'inbox',
          responseTime: data.responseTime
        })
      });
    },
    onSuccess: (data) => {
      console.log('SmartFeedback tracked successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to track SmartFeedback:', error);
    }
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (data: { interactionId: string; response: string; responseTime?: number }) => {
      return await apiRequest("/api/customer-service/respond", {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-service/interactions/all"] });
      setReplyText("");
      setSelectedMessage(null);
      toast({
        title: "Reply Sent",
        description: "Your response has been sent to the customer",
      });
    },
    onError: (error) => {
      toast({
        title: "Send Failed",
        description: "Could not send reply",
        variant: "destructive",
      });
    },
  });

  const getUrgencyColor = (score?: string) => {
    if (!score) return "bg-gray-100 text-gray-800";
    const numScore = parseFloat(score);
    if (numScore >= 76) return "bg-red-100 text-red-800 border-red-200";
    if (numScore >= 51) return "bg-orange-100 text-orange-800 border-orange-200";
    if (numScore >= 26) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getClassificationIcon = (classification?: string) => {
    switch (classification) {
      case "Complaint": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Urgent Issue": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "Question": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "Positive Feedback": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  // AgentAssistChat helper functions
  const handleGenerateReply = async (messageId: string) => {
    setLoadingSuggestion(true);
    setAgentSuggestion(null);
    try {
      await suggestReplyMutation.mutateAsync(messageId);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleUseReply = (suggestedReply: string) => {
    setReplyText(suggestedReply);
    if (selectedMessage && agentSuggestion) {
      feedbackMutation.mutate({
        messageId: selectedMessage.id,
        used: true,
        feedback: 'useful'
      });
      // Track positive feedback for SmartFeedback system
      trackSmartFeedback.mutate({
        messageId: selectedMessage.id,
        aiSuggestion: agentSuggestion.suggestedReply,
        feedback: 'useful',
        responseTime: suggestionStartTime ? Date.now() - suggestionStartTime : undefined
      });
    }
  };

  const handleCopyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Reply suggestion copied successfully",
    });
  };

  const seedTestDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/messages/seed-test-data", {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-service/interactions/all"] });
      toast({
        title: "Test Data Added",
        description: `${data.seededMessages?.length || 6} realistic customer messages have been added for AI analysis`,
      });
    },
    onError: (error) => {
      toast({
        title: "Seeding Failed",
        description: "Could not add test messages",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeMessage = (messageId: string) => {
    analyzeMessageMutation.mutate(messageId);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    const responseTime = selectedMessage.createdAt 
      ? Math.floor((Date.now() - new Date(selectedMessage.createdAt).getTime()) / 1000 / 60)
      : 0;

    sendReplyMutation.mutate({
      interactionId: selectedMessage.id,
      response: replyText,
      responseTime,
    });
  };

  const handleUseSuggestedReply = (suggestion: string) => {
    setReplyText(suggestion);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SmartInbox AI</h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered customer message intelligence with automated classification and reply suggestions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => seedTestDataMutation.mutate()}
            disabled={seedTestDataMutation.isPending}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {seedTestDataMutation.isPending ? "Adding..." : "Add Test Messages"}
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">AI Assistant Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Messages
            </CardTitle>
            <CardDescription>
              {interactions.length} messages • Click to analyze with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No customer messages yet</p>
                    <p className="text-sm">Messages will appear here for AI analysis</p>
                  </div>
                ) : (
                  interactions.map((interaction: CustomerInteraction) => (
                    <div
                      key={interaction.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedMessage?.id === interaction.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                      onClick={() => setSelectedMessage(interaction)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {interaction.customerName || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {interaction.aiClassification && (
                            <div className="flex items-center gap-1">
                              {getClassificationIcon(interaction.aiClassification)}
                              <span className="text-xs text-gray-600">
                                {interaction.aiClassification}
                              </span>
                            </div>
                          )}
                          {interaction.urgencyScore && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getUrgencyColor(interaction.urgencyScore)}`}
                            >
                              {Math.round(parseFloat(interaction.urgencyScore))}% urgent
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {interaction.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(interaction.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          {interaction.status === "responded" ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Responded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Pending
                            </Badge>
                          )}
                          {!interaction.aiAnalyzedAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyzeMessage(interaction.id);
                              }}
                              disabled={analyzeMessageMutation.isPending}
                            >
                              <Bot className="h-3 w-3 mr-1" />
                              Analyze
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Assistant Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Smart message analysis and reply suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-6">
                {/* Message Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Customer Message</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* AI Analysis Results */}
                {selectedMessage.aiAnalyzedAt && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        AI Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Classification</label>
                          <div className="flex items-center gap-2">
                            {getClassificationIcon(selectedMessage.aiClassification)}
                            <span className="text-sm">{selectedMessage.aiClassification}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Urgency Score</label>
                          <Badge className={getUrgencyColor(selectedMessage.urgencyScore)}>
                            {selectedMessage.urgencyScore 
                              ? `${Math.round(parseFloat(selectedMessage.urgencyScore))}%`
                              : "N/A"
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* AI Reply Suggestions */}
                    {selectedMessage.aiSuggestedReplies && selectedMessage.aiSuggestedReplies.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          Suggested Replies
                        </h4>
                        <div className="space-y-2">
                          {selectedMessage.aiSuggestedReplies.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                              onClick={() => handleUseSuggestedReply(suggestion)}
                            >
                              <p className="text-sm text-blue-900 dark:text-blue-100">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AgentAssistChat - GPT-Powered Reply Suggestions */}
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600" />
                        AgentAssist Chat
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateReply(selectedMessage.id)}
                        disabled={loadingSuggestion || suggestReplyMutation.isPending}
                        className="gap-2"
                      >
                        {loadingSuggestion || suggestReplyMutation.isPending ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        {loadingSuggestion || suggestReplyMutation.isPending ? "Generating..." : "Generate Reply"}
                      </Button>
                    </div>

                    {agentSuggestion && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                              GPT-4o Suggested Reply
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyReply(agentSuggestion.suggestedReply)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded border mb-3">
                          <p className="text-sm">{agentSuggestion.suggestedReply}</p>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <Button
                            size="sm"
                            onClick={() => handleUseReply(agentSuggestion.suggestedReply)}
                            className="gap-2"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Use This Reply
                          </Button>
                        </div>
                        
                        {/* Enhanced SmartReplyFeedback Component */}
                        <SmartReplyFeedback
                          messageId={selectedMessage.id}
                          aiSuggestion={agentSuggestion.suggestedReply}
                          onFeedbackSubmitted={(feedback) => {
                            // Also track with the existing feedback system for compatibility
                            feedbackMutation.mutate({
                              messageId: selectedMessage.id,
                              used: false,
                              feedback: feedback ? 'useful' : 'not_useful'
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Interface */}
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Send Reply</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {replyText.length}/500 characters
                        </span>
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || sendReplyMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {sendReplyMutation.isPending ? "Sending..." : "Send Reply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select a message to analyze</h3>
                <p className="text-sm">
                  Choose a customer message from the list to see AI analysis and get reply suggestions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}