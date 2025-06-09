import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getWebSocket } from "@/lib/websocket";
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  RefreshCw,
  Eye,
  Bell,
  Activity,
  TrendingDown,
  Ban
} from "lucide-react";

interface PageHealth {
  pageId: string;
  pageName: string;
  status: 'healthy' | 'warning' | 'restricted' | 'error';
  lastCheck: string;
  issues: string[];
  restrictionCount: number;
  checkHistory: {
    timestamp: string;
    status: string;
    issueCount: number;
  }[];
}

interface WatcherStatus {
  isRunning: boolean;
  checkInterval: number;
  lastCheck?: string;
  totalPages: number;
  healthyPages: number;
  pagesWithIssues: number;
}

interface AlertSettings {
  enableEmailAlerts: boolean;
  enableSlackAlerts: boolean;
  alertThreshold: number;
  checkInterval: number;
}

export default function PageStatus() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enableEmailAlerts: true,
    enableSlackAlerts: false,
    alertThreshold: 3,
    checkInterval: 10
  });
  const { toast } = useToast();

  const { data: watcherStatus, refetch: refetchStatus } = useQuery<WatcherStatus>({
    queryKey: ["/api/page-watcher/status"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: pageHealthData = [], refetch: refetchHealth } = useQuery<PageHealth[]>({
    queryKey: ["/api/page-watcher/health"],
    refetchInterval: 60000 // Refresh every minute
  });

  // Real-time updates via WebSocket
  useEffect(() => {
    const ws = getWebSocket();
    if (ws) {
      const handleHealthUpdate = (data: any) => {
        if (data.type === 'page_health_update') {
          refetchHealth();
          toast({
            title: `Page Status Update`,
            description: `${data.pageName} status: ${data.status}`,
            variant: data.status === 'restricted' ? 'destructive' : 'default'
          });
        }
      };

      ws.on('alert', handleHealthUpdate);
      
      return () => {
        ws.off('alert', handleHealthUpdate);
      };
    }
  }, [refetchHealth, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'restricted':
        return <Ban className="h-5 w-5 text-red-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      restricted: 'destructive',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStartWatcher = async () => {
    try {
      await fetch('/api/page-watcher/start', { method: 'POST' });
      refetchStatus();
      toast({
        title: "Page Watcher Started",
        description: "Monitoring has been activated for all connected pages."
      });
    } catch (error) {
      toast({
        title: "Failed to Start Watcher",
        description: "Could not start page monitoring.",
        variant: "destructive"
      });
    }
  };

  const handleStopWatcher = async () => {
    try {
      await fetch('/api/page-watcher/stop', { method: 'POST' });
      refetchStatus();
      toast({
        title: "Page Watcher Stopped",
        description: "Page monitoring has been deactivated."
      });
    } catch (error) {
      toast({
        title: "Failed to Stop Watcher",
        description: "Could not stop page monitoring.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await fetch('/api/page-watcher/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertSettings)
      });
      refetchStatus();
      toast({
        title: "Settings Updated",
        description: "Monitoring configuration has been saved."
      });
    } catch (error) {
      toast({
        title: "Failed to Update Settings",
        description: "Could not save monitoring configuration.",
        variant: "destructive"
      });
    }
  };

  const selectedPageData = selectedPage 
    ? pageHealthData.find(p => p.pageId === selectedPage)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page Status Monitor</h1>
        <p className="text-muted-foreground">
          Real-time monitoring and restriction detection for your Facebook pages
        </p>
      </div>

      {/* Watcher Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Monitoring Status
              </CardTitle>
              <CardDescription>
                Automated page health monitoring system
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {watcherStatus?.isRunning ? (
                <Button variant="outline" onClick={handleStopWatcher}>
                  Stop Monitoring
                </Button>
              ) : (
                <Button onClick={handleStartWatcher}>
                  Start Monitoring
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={() => refetchStatus()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                {watcherStatus?.isRunning ? (
                  <><Activity className="h-6 w-6 text-green-500" /> Active</>
                ) : (
                  <><XCircle className="h-6 w-6 text-gray-500" /> Inactive</>
                )}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{watcherStatus?.checkInterval || 0}m</div>
              <div className="text-sm text-muted-foreground">Check Interval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{watcherStatus?.totalPages || 0}</div>
              <div className="text-sm text-muted-foreground">Pages Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{watcherStatus?.pagesWithIssues || 0}</div>
              <div className="text-sm text-muted-foreground">Pages with Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Page Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Page Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pageHealthData.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No pages being monitored. Connect Facebook pages to start monitoring.
                </div>
              ) : (
                pageHealthData.map((page) => (
                  <div 
                    key={page.pageId}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPage === page.pageId ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedPage(page.pageId)}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(page.status)}
                      <div>
                        <div className="font-medium">{page.pageName}</div>
                        <div className="text-sm text-muted-foreground">
                          Last checked: {new Date(page.lastCheck).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {page.restrictionCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {page.restrictionCount} alerts
                        </Badge>
                      )}
                      {getStatusBadge(page.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Monitoring Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Check Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min="5"
                max="60"
                value={alertSettings.checkInterval}
                onChange={(e) => setAlertSettings(prev => ({
                  ...prev,
                  checkInterval: parseInt(e.target.value) || 10
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Alert Threshold (consecutive failures)</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                max="10"
                value={alertSettings.alertThreshold}
                onChange={(e) => setAlertSettings(prev => ({
                  ...prev,
                  alertThreshold: parseInt(e.target.value) || 3
                }))}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="email-alerts">Email Alerts</Label>
                </div>
                <Switch
                  id="email-alerts"
                  checked={alertSettings.enableEmailAlerts}
                  onCheckedChange={(checked) => setAlertSettings(prev => ({
                    ...prev,
                    enableEmailAlerts: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="slack-alerts">Slack Alerts</Label>
                </div>
                <Switch
                  id="slack-alerts"
                  checked={alertSettings.enableSlackAlerts}
                  onCheckedChange={(checked) => setAlertSettings(prev => ({
                    ...prev,
                    enableSlackAlerts: checked
                  }))}
                />
              </div>
            </div>

            <Button onClick={handleUpdateSettings} className="w-full">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Page Details */}
      {selectedPageData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedPageData.pageName} - Detailed Status
            </CardTitle>
            <CardDescription>
              Monitoring history and detected issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Current Issues</h4>
                {selectedPageData.issues.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No issues detected</p>
                ) : (
                  <div className="space-y-1">
                    {selectedPageData.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Check History</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedPageData.checkHistory.map((check, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <span>{new Date(check.timestamp).toLocaleString()}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {check.issueCount} issues
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}