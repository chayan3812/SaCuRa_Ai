import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface SystemMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
    heap: {
      used: number;
      total: number;
      external: number;
      arrayBuffers: number;
    };
  };
  cpuUsage: {
    user: number;
    system: number;
    percentage: number;
  };
  eventLoopLag: number;
  activeConnections: number;
  cacheHitRate: number;
  databasePoolStats: {
    total: number;
    idle: number;
    active: number;
    waiting: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: SystemMetrics | null;
  recommendations: string[];
}

interface PerformanceTrends {
  memoryTrend: 'improving' | 'stable' | 'degrading';
  cpuTrend: 'improving' | 'stable' | 'degrading';
  recommendations: string[];
}

export default function SystemHealth() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: systemHealth, refetch: refetchHealth } = useQuery({
    queryKey: ["/api/system/health"],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: performanceTrends, refetch: refetchTrends } = useQuery({
    queryKey: ["/api/system/trends"],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: optimizationHistory } = useQuery({
    queryKey: ["/api/system/optimizations"],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const health = systemHealth as SystemHealth;
  const trends = performanceTrends as PerformanceTrends;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring and optimization status
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="autoRefresh" className="text-sm">Auto Refresh</label>
            <input
              id="autoRefresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              refetchHealth();
              refetchTrends();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {health && getStatusIcon(health.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health ? (
                <span className={getStatusColor(health.status)}>
                  {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                </span>
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {health?.metrics ? (
              <div>
                <div className="text-2xl font-bold">
                  {health.metrics.memoryUsage.percentage.toFixed(1)}%
                </div>
                <Progress 
                  value={health.metrics.memoryUsage.percentage} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatBytes(health.metrics.memoryUsage.used)} / {formatBytes(health.metrics.memoryUsage.total)}
                </p>
              </div>
            ) : (
              <div className="text-gray-400">Loading...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Loop Lag</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {health?.metrics ? (
              <div>
                <div className="text-2xl font-bold">
                  {health.metrics.eventLoopLag.toFixed(1)}ms
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {health.metrics.eventLoopLag > 100 ? 'High lag detected' : 'Normal performance'}
                </p>
              </div>
            ) : (
              <div className="text-gray-400">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      {trends && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              System performance analysis over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.memoryTrend)}
                  <span className="font-medium">Memory Trend:</span>
                </div>
                <Badge variant={trends.memoryTrend === 'improving' ? 'default' : 
                              trends.memoryTrend === 'degrading' ? 'destructive' : 'secondary'}>
                  {trends.memoryTrend}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.cpuTrend)}
                  <span className="font-medium">CPU Trend:</span>
                </div>
                <Badge variant={trends.cpuTrend === 'improving' ? 'default' : 
                              trends.cpuTrend === 'degrading' ? 'destructive' : 'secondary'}>
                  {trends.cpuTrend}
                </Badge>
              </div>
            </div>

            {trends.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {trends.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {health?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Memory Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Heap Used:</span>
                <span>{formatBytes(health.metrics.memoryUsage.heap.used)}</span>
              </div>
              <div className="flex justify-between">
                <span>Heap Total:</span>
                <span>{formatBytes(health.metrics.memoryUsage.heap.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>External:</span>
                <span>{formatBytes(health.metrics.memoryUsage.heap.external)}</span>
              </div>
              <div className="flex justify-between">
                <span>Array Buffers:</span>
                <span>{formatBytes(health.metrics.memoryUsage.heap.arrayBuffers)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <span>{health.metrics.activeConnections}</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Hit Rate:</span>
                <span>{(health.metrics.cacheHitRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>DB Pool Active:</span>
                <span>{health.metrics.databasePoolStats.active}</span>
              </div>
              <div className="flex justify-between">
                <span>DB Pool Idle:</span>
                <span>{health.metrics.databasePoolStats.idle}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Recommendations */}
      {health?.recommendations && health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Recommendations</CardTitle>
            <CardDescription>
              Optimization suggestions based on current performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Optimizations */}
      {optimizationHistory && Array.isArray(optimizationHistory) && optimizationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Optimizations</CardTitle>
            <CardDescription>
              Automatic system optimizations performed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {optimizationHistory.slice(0, 10).map((opt: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-sm font-medium">{opt.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(opt.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}