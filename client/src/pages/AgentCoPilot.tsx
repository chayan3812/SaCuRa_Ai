import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Edit3, Check, X, Brain, TrendingUp, Zap, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AISuggestion {
  suggestionId: string;
  aiReply: string;
  confidence: number;
  model: string;
  responseTime: number;
}

interface CustomerMessage {
  id: string;
  customerName: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'ai_suggested' | 'agent_reviewed' | 'completed';
}

interface ImprovementStats {
  totalImprovements: number;
  avgScoreGain: number;
  topCategory: string;
  avgQuality: number;
}

export default function AgentCoPilot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<CustomerMessage | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedReply, setEditedReply] = useState("");
  const [timeframe, setTimeframe] = useState("7");

  // Mock customer messages for demo
  const mockMessages: CustomerMessage[] = [
    {
      id: "msg_1",
      customerName: "Sarah Johnson",
      message: "Hi, I'm having trouble with my Facebook ad campaign. The reach is very low despite having a good budget. Can you help me understand what might be wrong?",
      timestamp: new Date(),
      status: 'pending'
    },
    {
      id: "msg_2", 
      customerName: "Mike Chen",
      message: "My conversion rates have dropped significantly this week. I haven't changed anything in my campaigns. What could be causing this?",
      timestamp: new Date(),
      status: 'pending'
    },
    {
      id: "msg_3",
      customerName: "Emma Rodriguez",
      message: "I want to target a younger audience for my clothing brand. What targeting options would you recommend?",
      timestamp: new Date(),
      status: 'pending'
    }
  ];

  // Get agent improvement stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/agent-copilot/stats', user?.id, timeframe],
    enabled: !!user?.id,
  });

  // Generate AI suggestion mutation
  const generateSuggestionMutation = useMutation({
    mutationFn: async (data: { messageId: string; customerMessage: string; context?: any }) => {
      return await apiRequest('/api/agent-copilot/generate-suggestion', 'POST', data);
    },
    onSuccess: (data) => {
      setAiSuggestion(data);
      setEditedReply(data.aiReply);
      toast({
        title: "AI Suggestion Generated",
        description: `Confidence: ${(data.confidence * 100).toFixed(1)}%`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion",
        variant: "destructive",
      });
    },
  });

  // Store improvement mutation
  const storeImprovementMutation = useMutation({
    mutationFn: async (data: {
      messageId: string;
      originalAI: string;
      agentEdit: string;
      customerMessage: string;
      agentId: string;
    }) => {
      return await apiRequest('/api/agent-copilot/store-improvement', 'POST', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Improvement Stored",
        description: `Score gain: +${(data.scoreGain * 100).toFixed(1)}% | Category: ${data.category}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-copilot/stats'] });
      setEditMode(false);
      setSelectedMessage(null);
      setAiSuggestion(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to store improvement",
        variant: "destructive",
      });
    },
  });

  // Accept suggestion mutation
  const acceptSuggestionMutation = useMutation({
    mutationFn: async (data: { messageId: string; suggestionId: string; agentId: string }) => {
      return await apiRequest('/api/agent-copilot/accept-suggestion', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Suggestion Accepted",
        description: "AI suggestion accepted as-is",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agent-copilot/stats'] });
      setSelectedMessage(null);
      setAiSuggestion(null);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to accept suggestion",
        variant: "destructive",
      });
    },
  });

  const handleGenerateAI = (message: CustomerMessage) => {
    setSelectedMessage(message);
    generateSuggestionMutation.mutate({
      messageId: message.id,
      customerMessage: message.message,
      context: { customerName: message.customerName }
    });
  };

  const handleEditReply = () => {
    setEditMode(true);
  };

  const handleSaveImprovement = () => {
    if (!selectedMessage || !aiSuggestion || !user?.id) return;

    storeImprovementMutation.mutate({
      messageId: selectedMessage.id,
      originalAI: aiSuggestion.aiReply,
      agentEdit: editedReply,
      customerMessage: selectedMessage.message,
      agentId: user.id
    });
  };

  const handleAcceptSuggestion = () => {
    if (!selectedMessage || !aiSuggestion || !user?.id) return;

    acceptSuggestionMutation.mutate({
      messageId: selectedMessage.id,
      suggestionId: aiSuggestion.suggestionId,
      agentId: user.id
    });
  };

  const handleCancelEdit = () => {
    setEditedReply(aiSuggestion?.aiReply || "");
    setEditMode(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Co-Pilot</h1>
          <p className="text-muted-foreground">AI-powered reply suggestions with one-click improvements</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Improvements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats?.totalImprovements || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score Gain</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{((stats?.stats?.avgScoreGain || 0) * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stats?.topCategory || "N/A"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((stats?.stats?.avgQuality || 0) * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Customer Messages</CardTitle>
            <CardDescription>Select a message to generate AI suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{message.customerName}</span>
                  <Badge variant="outline">{message.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{message.message}</p>
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateAI(message);
                    }}
                    disabled={generateSuggestionMutation.isPending}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate AI Reply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Suggestion Panel */}
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestion</CardTitle>
            <CardDescription>
              {selectedMessage ? `Reply for ${selectedMessage.customerName}` : "Select a message to see AI suggestions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMessage && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-2">Customer Message:</p>
                <p className="text-sm">{selectedMessage.message}</p>
              </div>
            )}

            {generateSuggestionMutation.isPending && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Generating AI suggestion...</p>
                </div>
              </div>
            )}

            {aiSuggestion && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      Confidence: {(aiSuggestion.confidence * 100).toFixed(1)}%
                    </Badge>
                    <Badge variant="outline">
                      {aiSuggestion.model}
                    </Badge>
                    <Badge variant="outline">
                      {aiSuggestion.responseTime}ms
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditReply}
                      disabled={editMode}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptSuggestion}
                      disabled={editMode || acceptSuggestionMutation.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Suggested Reply:</label>
                  {editMode ? (
                    <Textarea
                      value={editedReply}
                      onChange={(e) => setEditedReply(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Edit the AI suggestion..."
                    />
                  ) : (
                    <div className="p-3 bg-white dark:bg-gray-900 border rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{aiSuggestion.aiReply}</p>
                    </div>
                  )}
                </div>

                {editMode && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveImprovement}
                      disabled={storeImprovementMutation.isPending || editedReply === aiSuggestion.aiReply}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Save & Retrain
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Improvements */}
      {stats?.recentImprovements?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Improvements</CardTitle>
            <CardDescription>Your latest AI reply improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentImprovements.slice(0, 5).map((improvement: any, index: number) => (
                <div key={improvement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{improvement.improvementCategory}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Score: +{((improvement.scoreGainEstimate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm mt-1 line-clamp-2">{improvement.improvedReply}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(improvement.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}