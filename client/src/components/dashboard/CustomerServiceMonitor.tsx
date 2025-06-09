import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, Bot, User, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CustomerInteraction } from "@/types";
import { getWebSocket } from "@/lib/websocket";

export default function CustomerServiceMonitor() {
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  
  const { data: initialInteractions = [] } = useQuery<CustomerInteraction[]>({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    setInteractions(initialInteractions);
  }, [initialInteractions]);

  useEffect(() => {
    const ws = getWebSocket();
    
    const handleNewMessage = (data: CustomerInteraction) => {
      setInteractions(prev => [data, ...prev.slice(0, 9)]);
    };

    const handleAIResponse = (data: any) => {
      setInteractions(prev => 
        prev.map(interaction => 
          interaction.id === data.id 
            ? { ...interaction, ...data }
            : interaction
        )
      );
    };

    ws.on('new-customer-message', handleNewMessage);
    ws.on('ai-response-generated', handleAIResponse);
    ws.on('interaction-updated', handleAIResponse);

    return () => {
      ws.off('new-customer-message', handleNewMessage);
      ws.off('ai-response-generated', handleAIResponse);
      ws.off('interaction-updated', handleAIResponse);
    };
  }, []);

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
      return <Badge variant="secondary" className="text-green-600 border-green-200 bg-green-50">Auto</Badge>;
    }
    return <Badge variant="default" className="text-blue-600 border-blue-200 bg-blue-50">Human</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sacura-secondary/10 rounded-lg flex items-center justify-center">
              <Headphones className="text-sacura-secondary w-4 h-4" />
            </div>
            <span>Live Customer Service</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-sacura-secondary/10 text-sacura-secondary">
            <div className="w-2 h-2 bg-sacura-secondary rounded-full notification-dot mr-2"></div>
            AI Handling 89%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent customer interactions.</p>
              <p className="text-sm">Interactions will appear here in real-time.</p>
            </div>
          ) : (
            interactions.slice(0, 6).map((interaction) => (
              <div 
                key={interaction.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  interaction.status === 'pending' ? 'bg-amber-50 border border-amber-200' : 'hover:bg-muted'
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  {interaction.isAutoResponse ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Bot className="text-green-600 w-4 h-4" />
                    </div>
                  ) : interaction.status === 'responded' ? (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600 w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="text-amber-600 w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {interaction.isAutoResponse 
                      ? 'AI responded to inquiry'
                      : interaction.status === 'responded' 
                        ? 'Employee handled inquiry'
                        : 'Awaiting response'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interaction.customerName} • {formatTimeAgo(interaction.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    "{interaction.response || interaction.message}"
                  </p>
                </div>
                {getStatusBadge(interaction)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
