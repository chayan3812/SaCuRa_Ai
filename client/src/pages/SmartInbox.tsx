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
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
}

interface AIAnalysis {
  messageId: string;
  classification: string;
  urgencyScore: number;
  replySuggestions: string[];
  analyzedAt: string;
}

export default function SmartInbox() {
  const [selectedMessage, setSelectedMessage] = useState<CustomerInteraction | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interactions = [], isLoading } = useQuery<CustomerInteraction[]>({
    queryKey: ["/api/customer-service/interactions/all"],
  });

  const analyzeMessageMutation = useMutation({
    mutationFn: async (messageId: string): Promise<AIAnalysis> => {
      return await apiRequest("/api/messages/analyze", "POST", { messageId });
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

  const sendReplyMutation = useMutation({
    mutationFn: async (data: { interactionId: string; response: string; responseTime?: number }) => {
      return await apiRequest("/api/customer-service/respond", "POST", data);
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
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium">AI Assistant Active</span>
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