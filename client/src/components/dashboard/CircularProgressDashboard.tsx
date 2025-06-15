import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Target, Users, Zap, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface CircularMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  color: string;
  icon: any;
  unit: string;
  description: string;
}

export default function CircularProgressDashboard() {
  const [animationProgress, setAnimationProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 30000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000,
  });

  const { data: customerInteractions } = useQuery({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 20000,
  });

  const circularMetrics: CircularMetric[] = [
    {
      id: 'ai_learning',
      label: 'AI Learning',
      value: aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics 
        ? (aiMetrics as any).customerToneAnalysis || 85 : 85,
      target: 100,
      color: '#8b5cf6',
      icon: Brain,
      unit: '%',
      description: 'Continuous AI model improvement'
    },
    {
      id: 'performance',
      label: 'Performance',
      value: metrics?.avgResponseTime ? Math.max(70, 100 - metrics.avgResponseTime) : 92,
      target: 100,
      color: '#10b981',
      icon: Zap,
      unit: '%',
      description: 'System response optimization'
    },
    {
      id: 'engagement',
      label: 'Engagement',
      value: 88,
      target: 100,
      color: '#f59e0b',
      icon: Target,
      unit: '%',
      description: 'User interaction quality'
    },
    {
      id: 'satisfaction',
      label: 'Satisfaction',
      value: 94,
      target: 100,
      color: '#3b82f6',
      icon: Users,
      unit: '%',
      description: 'Customer feedback score'
    }
  ];

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  const renderCircularChart = (metric: CircularMetric, size: number = 200) => {
    const Icon = metric.icon;
    const radius = (size - 40) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (metric.value / 100) * circumference * animationProgress;
    const center = size / 2;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg
          width={size}
          height={size}
          className="absolute transform -rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="12"
            fill="none"
          />
          
          {/* Progress Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={metric.color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${metric.color}40)`
            }}
          />
          
          {/* Inner glow effect */}
          <circle
            cx={center}
            cy={center}
            r={radius - 20}
            stroke={metric.color}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${metric.color}20, ${metric.color}10)`,
              border: `2px solid ${metric.color}30`
            }}
          >
            <Icon className="w-8 h-8" style={{ color: metric.color }} />
          </div>
          
          <div className="space-y-1">
            <div 
              className="text-3xl font-black"
              style={{ color: metric.color }}
            >
              {Math.round(metric.value * animationProgress)}{metric.unit}
            </div>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {metric.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 max-w-[120px]">
              {metric.description}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl text-slate-800 dark:text-slate-200">
              <Target className="w-6 h-6 text-blue-600" />
              Performance Circles
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Circular progress visualization with real-time analytics
            </CardDescription>
          </div>
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-300 px-3 py-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
            Live Updates
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8" ref={containerRef}>
        {/* Main Circular Charts Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {circularMetrics.map((metric) => (
            <div key={metric.id} className="flex flex-col items-center">
              {renderCircularChart(metric, 180)}
              
              {/* Status Badge */}
              <Badge 
                className={`mt-4 ${
                  metric.value >= 90 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : metric.value >= 70 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {metric.value >= 90 ? 'Excellent' : metric.value >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-xl border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(circularMetrics.reduce((sum, m) => sum + m.value, 0) / circularMetrics.length)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Overall Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {circularMetrics.filter(m => m.value >= 85).length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">High Performers</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              +5.2%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Weekly Growth</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">A+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Performance Grade</div>
          </div>
        </div>

        {/* Trend Indicators */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {circularMetrics.map((metric, index) => (
            <div 
              key={metric.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-slate-800 shadow-sm"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              ></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {metric.label}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  +{(2.1 + index * 0.8).toFixed(1)}% this week
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}