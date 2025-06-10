import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Bot, User, Clock, MessageCircle, Activity, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { CustomerInteraction } from "@/types";

export default function CustomerServiceMonitor() {
  const { data: interactions = [], isLoading } = useQuery<CustomerInteraction[]>({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 15000,
    staleTime: 10000,
  });

  const stats = useMemo(() => {
    const totalInteractions = interactions.length;
    const pending = interactions.filter(i => i.status === 'pending').length;
    const resolved = interactions.filter(i => i.status === 'resolved').length;
    const avgResponseTime = interactions.length > 0 
      ? interactions.reduce((sum, i) => sum + (i.responseTime || 0), 0) / interactions.length 
      : 0;

    return { totalInteractions, pending, resolved, avgResponseTime };
  }, [interactions]);

  const recentInteractions = useMemo(() => 
    interactions.slice(0, 5), 
    [interactions]
  );

  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock },
      resolved: { variant: "default" as const, icon: CheckCircle },
      escalated: { variant: "destructive" as const, icon: Activity }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Customer Service Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-16 bg-muted rounded mx-auto mb-2"></div>
                    <div className="h-4 w-20 bg-muted rounded mx-auto"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Headphones className="h-5 w-5" />
            <span>Customer Service Monitor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalInteractions}</div>
              <div className="text-sm text-muted-foreground">Total Today</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>

          {/* Recent Interactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Recent Interactions</span>
              </h4>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            {recentInteractions.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent interactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {interaction.customerName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{interaction.customerName || 'Anonymous User'}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {interaction.message || 'No message content'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {interaction.aiGenerated && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          AI
                        </Badge>
                      )}
                      {getStatusBadge(interaction.status || 'pending')}
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(interaction.createdAt || new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}