import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Lightbulb,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RestrictionAlert } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RestrictionMonitor() {
  const { toast } = useToast();
  
  const { data: alerts = [], isLoading } = useQuery<RestrictionAlert[]>({
    queryKey: ['/api/restrictions/alerts'],
    refetchInterval: 30000,
  });

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiRequest('POST', `/api/restrictions/resolve/${alertId}`, {});
      
      toast({
        title: "Alert Resolved",
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return XCircle;
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Clock;
      default:
        return CheckCircle;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'policy_violation':
        return AlertTriangle;
      case 'ad_rejected':
        return XCircle;
      case 'account_warning':
        return Clock;
      default:
        return Shield;
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);
  const resolvedAlerts = alerts.filter(alert => alert.isResolved);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
                    <p className="text-sm font-medium text-muted-foreground">Resolved This Month</p>
                    <p className="text-2xl font-bold text-foreground">{resolvedAlerts.length}</p>
                    <p className="text-sm text-sacura-secondary">↓ 67% vs last month</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Prevention Rate</p>
                    <p className="text-2xl font-bold text-foreground">94%</p>
                    <p className="text-sm text-sacura-secondary">AI effectiveness</p>
                  </div>
                  <div className="w-12 h-12 bg-sacura-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="text-sacura-primary w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                    <p className="text-2xl font-bold text-foreground">Low</p>
                    <p className="text-sm text-sacura-secondary">Overall account health</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="text-green-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Active Alerts ({unresolvedAlerts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-full mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-8 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : unresolvedAlerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">All Clear! 🎉</h3>
                  <p>No active restriction alerts. Your Facebook accounts are in good standing.</p>
                  <p className="text-sm mt-1">Our AI continues to monitor for potential issues 24/7.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unresolvedAlerts.map((alert) => {
                    const SeverityIcon = getSeverityIcon(alert.severity);
                    const TypeIcon = getAlertTypeIcon(alert.alertType);
                    
                    return (
                      <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex space-x-2">
                              <SeverityIcon className="w-5 h-5 mt-0.5" />
                              <TypeIcon className="w-5 h-5 mt-0.5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {alert.alertType.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {alert.severity} severity
                                </Badge>
                              </div>
                              <p className="font-medium text-foreground mb-2">{alert.message}</p>
                              {alert.aiSuggestion && (
                                <div className="bg-background/50 p-3 rounded border">
                                  <div className="flex items-start space-x-2">
                                    <Lightbulb className="w-4 h-4 mt-0.5 text-sacura-primary" />
                                    <div>
                                      <p className="text-sm font-medium">AI Suggestion:</p>
                                      <p className="text-sm text-muted-foreground">{alert.aiSuggestion}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Detected: {formatDate(alert.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleResolveAlert(alert.id)}
                            size="sm"
                            variant="outline"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Resolved Alerts */}
          {resolvedAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Recently Resolved ({resolvedAlerts.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="capitalize text-green-700 border-green-300">
                                {alert.alertType.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground mb-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              Resolved: {alert.resolvedAt ? formatDate(alert.resolvedAt) : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policy Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>AI Policy Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Content Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Avoid exaggerated claims and guarantees</li>
                    <li>• Use clear, honest language</li>
                    <li>• Include proper disclaimers where required</li>
                    <li>• Respect intellectual property rights</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Best Practices</h4>
                  <ul className="text-sm text-green-800 space-y-1">
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
