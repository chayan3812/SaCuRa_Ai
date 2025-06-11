import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  Bot, 
  User, 
  Clock, 
  MessageSquare, 
  Send,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomerInteraction } from "@/types";
import { getWebSocket } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerService() {
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [responseText, setResponseText] = useState("");
  const [selectedInteraction, setSelectedInteraction] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const { toast } = useToast();

  const { data: allInteractions = [], isLoading } = useQuery<CustomerInteraction[]>({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    setInteractions(allInteractions);
  }, [allInteractions]);

  useEffect(() => {
    const ws = getWebSocket();
    
    const handleNewMessage = (data: any) => {
      setInteractions(prev => [data, ...prev]);
    };

    const handleResponseUpdate = (data: any) => {
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === data.id ? { ...interaction, ...data } : interaction
        )
      );
    };

    ws.on('new-customer-message', handleNewMessage);
    ws.on('ai-response-generated', handleResponseUpdate);
    ws.on('interaction-updated', handleResponseUpdate);

    return () => {
      ws.off('new-customer-message', handleNewMessage);
      ws.off('ai-response-generated', handleResponseUpdate);
      ws.off('interaction-updated', handleResponseUpdate);
    };
  }, []);

  const handleSendResponse = async () => {
    if (!selectedInteraction || !responseText.trim()) return;

    try {
      await apiRequest('/api/customer-service/respond', {
        method: 'POST',
        body: JSON.stringify({
          interactionId: selectedInteraction,
          response: responseText,
          responseTime: 30
        })
      });

      setResponseText("");
      setSelectedInteraction(null);
      
      toast({
        title: "Response sent",
        description: "Your response has been sent to the customer.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateAIResponse = async (interactionId: string) => {
    try {
      const interaction = interactions.find(i => i.id === interactionId);
      if (!interaction) return;

      await apiRequest('/api/customer-service/ai-response', {
        method: 'POST',
        body: JSON.stringify({
          interactionId,
          message: interaction.message,
          context: interaction.context || {}
        })
      });

      toast({
        title: "AI Response Generated",
        description: "AI has generated a response for this interaction.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pendingInteractions = interactions.filter(i => i.status === 'pending');
  const resolvedInteractions = interactions.filter(i => i.status === 'responded');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Service</h1>
          <p className="text-muted-foreground">AI-powered customer service automation and monitoring</p>
        </div>
        <Badge variant="secondary" className="bg-sacura-secondary/10 text-sacura-secondary">
          <div className="w-2 h-2 bg-sacura-secondary rounded-full notification-dot mr-2"></div>
          Live Monitoring
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Interactions</p>
                <p className="text-2xl font-bold text-foreground">{interactions.length}</p>
                <p className="text-sm text-sacura-secondary">Today</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingInteractions.length}</p>
                <p className="text-sm text-orange-600">Needs attention</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{resolvedInteractions.length}</p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">
                  {interactions.length > 0 
                    ? `${(interactions.reduce((sum, i) => sum + (i.responseTime || 0), 0) / interactions.length).toFixed(1)}s`
                    : '0s'
                  }
                </p>
                <p className="text-sm text-sacura-secondary">Response time</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Interactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-sacura-primary" />
              <span>Live Customer Interactions</span>
              {pendingInteractions.length > 0 && (
                <Badge variant="destructive">{pendingInteractions.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingInteractions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingInteractions.map((interaction) => (
                  <div 
                    key={interaction.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedInteraction === interaction.id 
                        ? 'border-sacura-primary bg-sacura-primary/5' 
                        : 'border-border hover:border-sacura-primary/50'
                    }`}
                    onClick={() => setSelectedInteraction(interaction.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <User className="w-8 h-8 text-muted-foreground mt-1" />
                        <div>
                          <h4 className="font-medium">{interaction.customerName}</h4>
                          <p className="text-sm text-muted-foreground">{interaction.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(interaction.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateAIResponse(interaction.id);
                        }}
                      >
                        <Bot className="w-4 h-4 mr-1" />
                        AI
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending interactions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-sacura-primary" />
              <span>Quick Response</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedInteraction ? (
                <>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Responding to: {interactions.find(i => i.id === selectedInteraction)?.customerName}
                    </p>
                  </div>
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-32"
                  />
                  <Button 
                    onClick={handleSendResponse} 
                    disabled={!responseText.trim()}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select an interaction to respond</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Response Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-sacura-primary" />
              <span>AI Response Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Quick AI-generated responses for common customer inquiries
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  'Thank you for contacting us',
                  'I understand your concern',
                  'Let me help you with that',
                  'This issue will be resolved',
                  'Thank you for your patience',
                  'We appreciate your feedback'
                ].map((template) => (
                  <Button
                    key={template}
                    variant="outline"
                    size="sm"
                    onClick={() => setResponseText(template)}
                    className="justify-start text-left h-auto p-3 whitespace-normal"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}