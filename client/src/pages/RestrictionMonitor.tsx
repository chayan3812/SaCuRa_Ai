import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  TrendingUp,
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWebSocket } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";

interface RestrictionAlert {
  id: string;
  type: 'content_warning' | 'policy_violation' | 'account_restriction' | 'engagement_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedContent: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'investigating';
  recommendation: string;
}

export default function RestrictionMonitor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const { toast } = useToast();

  const { data: alerts = [], isLoading } = useQuery<RestrictionAlert[]>({
    queryKey: ['/api/restrictions/alerts'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    const ws = getWebSocket();
    
    const handleNewAlert = (data: any) => {
      toast({
        title: "New Restriction Alert",
        description: data.title,
        variant: data.severity === 'critical' ? 'destructive' : 'default',
      });
    };

    ws.on('restriction-alert', handleNewAlert);
    return () => ws.off('restriction-alert', handleNewAlert);
  }, [toast]);

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiRequest('/api/restrictions/resolve', {
        method: 'POST',
        body: JSON.stringify({ alertId })
      });
      
      toast({
        title: "Alert resolved",
        description: "The restriction alert has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const unresolvedAlerts = alerts.filter(alert => alert.status === 'active');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Restriction Monitor</h1>
          <p className="text-muted-foreground">AI-powered Facebook policy compliance and restriction prevention</p>
        </div>
        <Badge variant="secondary" className="bg-sacura-primary/10 text-sacura-primary">
          <Shield className="w-4 h-4 mr-1" />
          Protected
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-foreground">{unresolvedAlerts.length}</p>
                <p className="text-sm text-amber-600">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-amber-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{resolvedAlerts.length}</p>
                <p className="text-sm text-green-600">This month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-foreground">{criticalAlerts.length}</p>
                <p className="text-sm text-red-600">High priority</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="text-red-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prevention Rate</p>
                <p className="text-2xl font-bold text-foreground">94%</p>
                <p className="text-sm text-sacura-secondary">AI accuracy</p>
              </div>
              <div className="w-12 h-12 bg-sacura-primary/10 rounded-lg flex items-center justify-center">
                <Bot className="text-sacura-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'resolved'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Active Alerts</span>
              {unresolvedAlerts.length > 0 && (
                <Badge variant="destructive">{unresolvedAlerts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="p-4 border rounded-lg">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAlerts.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatTime(alert.timestamp)}
                        </p>
                      </div>
                      {alert.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                    {alert.recommendation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>AI Recommendation:</strong> {alert.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No alerts found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prevention Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sacura-primary" />
              <span>Prevention Best Practices</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Content Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Avoid overly promotional language</li>
                  <li>• Use authentic, non-stock images</li>
                  <li>• Include clear value propositions</li>
                  <li>• Maintain consistent brand messaging</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Engagement Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Respond to comments promptly</li>
                  <li>• Encourage meaningful discussions</li>
                  <li>• Share user-generated content</li>
                  <li>• Post consistently but not excessively</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Monitoring Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Regular content review and updates</li>
                  <li>• Monitor audience feedback and sentiment</li>
                  <li>• Stay updated on policy changes</li>
                  <li>• Use AI recommendations proactively</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}