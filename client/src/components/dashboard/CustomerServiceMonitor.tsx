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
    const responded = interactions.filter(i => i.status === 'responded').length;
    const avgResponseTime = interactions.length > 0 
      ? interactions.reduce((sum, i) => sum + (i.responseTime || 0), 0) / interactions.length 
      : 0;

    return { totalInteractions, pending, responded, avgResponseTime };
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
      responded: { variant: "default" as const, icon: CheckCircle },
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Customer Service Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-6 sm:h-8 w-12 sm:w-16 bg-muted rounded mx-auto mb-2"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-20 bg-muted rounded mx-auto"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 sm:h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg">Customer Service Monitor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 md:space-y-6">
          {/* Enhanced Summary Stats - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{stats.totalInteractions}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Today</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.responded}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Responded</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{Math.round(stats.avgResponseTime)}s</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg Response</div>
            </div>
          </div>

          {/* Recent Interactions - Mobile-first Layout */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h4 className="font-medium flex items-center space-x-2 text-sm sm:text-base">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Recent Interactions</span>
              </h4>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm w-fit">View All</Button>
            </div>
            
            {recentInteractions.length === 0 ? (
              <div className="text-center p-6 sm:p-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">No recent interactions</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                        {interaction.customerName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{interaction.customerName || 'Anonymous User'}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">
                          {interaction.message || 'No message content'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 flex-wrap">
                      <div className="flex items-center space-x-2">
                        {interaction.isAutoResponse && (
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Bot className="h-2 w-2 sm:h-3 sm:w-3" />
                            AI
                          </Badge>
                        )}
                        {getStatusBadge(interaction.status || 'pending')}
                      </div>
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