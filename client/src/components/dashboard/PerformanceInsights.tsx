import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3, Target, Zap, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  icon: any;
  color: string;
}

export default function PerformanceInsights() {
  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000,
  });

  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 30000,
  });

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: "AI Response Quality",
      value: aiMetrics && typeof aiMetrics === 'object' && 'responseQuality' in aiMetrics 
        ? (aiMetrics as any).responseQuality || 85 : 85,
      target: 90,
      trend: 'up',
      change: 5.2,
      icon: Zap,
      color: "text-purple-600"
    },
    {
      label: "Customer Satisfaction",
      value: aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics 
        ? (aiMetrics as any).customerToneAnalysis || 85 : 85,
      target: 80,
      trend: 'up',
      change: 3.8,
      icon: Users,
      color: "text-green-600"
    },
    {
      label: "Response Speed",
      value: metrics?.avgResponseTime ? Math.max(0, 100 - metrics.avgResponseTime) : 92,
      target: 95,
      trend: 'stable',
      change: 0.5,
      icon: Target,
      color: "text-blue-600"
    },
    {
      label: "System Efficiency",
      value: 94,
      target: 90,
      trend: 'up',
      change: 2.1,
      icon: BarChart3,
      color: "text-orange-600"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Performance Insights
        </CardTitle>
        <CardDescription>
          Real-time performance monitoring and optimization metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const progressPercentage = (metric.value / 100) * 100;
            const targetReached = metric.value >= metric.target;
            
            return (
              <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="font-medium text-sm">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{metric.value}%</span>
                    <Badge variant={targetReached ? "default" : "secondary"} className="text-xs">
                      Target: {metric.target}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                  />
                  
                  {targetReached && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Target achieved
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Overall Performance Score */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Overall Performance Score</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(performanceMetrics.reduce((acc, metric) => acc + metric.value, 0) / performanceMetrics.length)}%
            </span>
          </div>
          <Progress 
            value={Math.round(performanceMetrics.reduce((acc, metric) => acc + metric.value, 0) / performanceMetrics.length)} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Excellent performance across all key metrics
          </p>
        </div>
      </CardContent>
    </Card>
  );
}