import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
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

  const { data: initialInteractions = [] } = useQuery<CustomerInteraction[]>({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    setInteractions(initialInteractions);
  }, [initialInteractions]);

  useEffect(() => {
    const ws = getWebSocket();
    
    const handleNewMessage = (data: CustomerInteraction) => {
      setInteractions(prev => [data, ...prev]);
    };

    const handleResponseUpdate = (data: any) => {
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === data.id 
            ? { ...interaction, ...data }
            : interaction
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
      await apiRequest('POST', '/api/customer-service/respond', {
        interactionId: selectedInteraction,
        response: responseText,
        responseTime: 30 // Mock response time
      });

      setResponseText("");
      setSelectedInteraction(null);
      
      toast({
        title: "Response Sent",
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getStatusBadge = (interaction: CustomerInteraction) => {
    if (interaction.status === 'pending') {
      return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>;
    }
    if (interaction.isAutoResponse) {
      return <Badge variant="secondary" className="text-green-600 border-green-200 bg-green-50">AI Response</Badge>;
    }
    return <Badge variant="default" className="text-blue-600 border-blue-200 bg-blue-50">Human Response</Badge>;
  };

  const pendingInteractions = interactions.filter(i => i.status === 'pending');
  const resolvedInteractions = interactions.filter(i => i.status === 'responded');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        
        <div className="p-6 space-y-6">
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
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Responses</p>
                    <p className="text-2xl font-bold text-foreground">
                      {interactions.filter(i => i.isAutoResponse).length}
                    </p>
                    <p className="text-sm text-sacura-secondary">89% of total</p>
                  </div>
                  <div className="w-12 h-12 bg-sacura-secondary/10 rounded-lg flex items-center justify-center">
                    <Bot className="text-sacura-secondary w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{pendingInteractions.length}</p>
                    <p className="text-sm text-amber-600">Needs attention</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="text-amber-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold text-foreground">0.8s</p>
                    <p className="text-sm text-sacura-secondary">AI average</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-green-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactions List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Interactions</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={activeTab === 'live' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('live')}
                    >
                      Live ({pendingInteractions.length})
                    </Button>
                    <Button
                      variant={activeTab === 'history' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('history')}
                    >
                      History
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(activeTab === 'live' ? pendingInteractions : resolvedInteractions).map((interaction) => (
                    <div
                      key={interaction.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedInteraction === interaction.id 
                          ? 'border-sacura-primary bg-sacura-primary/5' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedInteraction(interaction.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-medium text-foreground">{interaction.customerName}</p>
                            {getStatusBadge(interaction)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            "{interaction.message}"
                          </p>
                          {interaction.response && (
                            <p className="text-sm text-sacura-primary bg-sacura-primary/10 p-2 rounded">
                              Response: "{interaction.response}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimeAgo(interaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(activeTab === 'live' ? pendingInteractions : resolvedInteractions).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No {activeTab === 'live' ? 'pending' : 'resolved'} interactions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Response Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Quick Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedInteraction ? (
                  <>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Selected Interaction</p>
                      <p className="text-sm text-muted-foreground">
                        {interactions.find(i => i.id === selectedInteraction)?.customerName}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Response</label>
                      <Textarea
                        placeholder="Type your response here..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSendResponse}
                      className="w-full"
                      disabled={!responseText.trim()}
                    >
                      Send Response
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select an interaction to respond</p>
                  </div>
                )}

                {/* Quick Response Templates */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Templates</label>
                  <div className="space-y-2">
                    {[
                      "Thank you for reaching out! How can I help you today?",
                      "I understand your concern. Let me look into this for you.",
                      "Thanks for your patience. I'll get back to you shortly.",
                    ].map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start text-xs"
                        onClick={() => setResponseText(template)}
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
      </main>
    </div>
  );
}
