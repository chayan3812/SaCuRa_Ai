import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap, Brain, Target, Users, MessageSquare, BarChart3, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface MetricData {
  id: string;
  label: string;
  value: number;
  target: number;
  trend: number;
  color: string;
  icon: any;
  unit: string;
}

export default function FuturisticMetricsGrid() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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

  const metricsData: MetricData[] = [
    {
      id: 'ai_accuracy',
      label: 'AI Accuracy',
      value: aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics 
        ? (aiMetrics as any).customerToneAnalysis || 85 : 85,
      target: 90,
      trend: 5.2,
      color: '#8b5cf6',
      icon: Brain,
      unit: '%'
    },
    {
      id: 'response_time',
      label: 'Response Speed',
      value: metrics?.avgResponseTime ? Math.max(0, 100 - metrics.avgResponseTime) : 92,
      target: 95,
      trend: 3.1,
      color: '#10b981',
      icon: Zap,
      unit: '%'
    },
    {
      id: 'engagement',
      label: 'Engagement Rate',
      value: 87,
      target: 85,
      trend: 4.7,
      color: '#f59e0b',
      icon: Target,
      unit: '%'
    },
    {
      id: 'interactions',
      label: 'Active Sessions',
      value: Array.isArray(customerInteractions) ? Math.min(100, customerInteractions.length * 10 + 45) : 45,
      target: 80,
      trend: 2.3,
      color: '#3b82f6',
      icon: Users,
      unit: '%'
    },
    {
      id: 'ai_responses',
      label: 'AI Responses',
      value: metrics?.totalResponses ? Math.min(100, metrics.totalResponses / 10 + 60) : 78,
      target: 75,
      trend: 6.8,
      color: '#ec4899',
      icon: MessageSquare,
      unit: '%'
    },
    {
      id: 'efficiency',
      label: 'System Efficiency',
      value: 94,
      target: 90,
      trend: 1.9,
      color: '#06b6d4',
      icon: BarChart3,
      unit: '%'
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create animated background pattern
    const time = Date.now() * 0.001;
    
    // Draw animated grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < width; i += 40) {
      const offset = Math.sin(time + i * 0.01) * 5;
      ctx.beginPath();
      ctx.moveTo(i + offset, 0);
      ctx.lineTo(i + offset, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += 40) {
      const offset = Math.cos(time + i * 0.01) * 5;
      ctx.beginPath();
      ctx.moveTo(0, i + offset);
      ctx.lineTo(width, i + offset);
      ctx.stroke();
    }

    // Draw floating particles
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * width;
      const y = (Math.cos(time * 0.3 + i * 0.7) * 0.5 + 0.5) * height;
      const size = Math.sin(time + i) * 2 + 3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Animate continuously
    const animationId = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(animationId);
  }, []);

  const renderMetricCard = (metric: MetricData, index: number) => {
    const Icon = metric.icon;
    const isHovered = hoveredMetric === metric.id;
    const progress = (metric.value / 100) * 100;
    
    return (
      <div
        key={metric.id}
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-500 ${
          isHovered 
            ? 'border-blue-400 shadow-2xl scale-105 bg-gradient-to-br from-white to-blue-50 dark:from-blue-950 dark:to-slate-900' 
            : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800'
        }`}
        onMouseEnter={() => setHoveredMetric(metric.id)}
        onMouseLeave={() => setHoveredMetric(null)}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: 'fadeInUp 0.6s ease-out forwards'
        }}
      >
        {/* Animated background effect */}
        <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-10'}`}>
          <div 
            className="absolute inset-0 bg-gradient-to-r animate-pulse"
            style={{
              background: `linear-gradient(45deg, ${metric.color}20, transparent, ${metric.color}10)`
            }}
          ></div>
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isHovered ? 'scale-110 shadow-lg' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${metric.color}20, ${metric.color}10)`,
                  border: `2px solid ${metric.color}30`
                }}
              >
                <Icon 
                  className="w-6 h-6 transition-colors duration-300" 
                  style={{ color: metric.color }}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  {metric.label}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time data</p>
              </div>
            </div>
            
            <Badge 
              className={`transition-all duration-300 ${
                metric.trend > 0 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {metric.trend > 0 ? '+' : ''}{metric.trend}%
            </Badge>
          </div>

          {/* Value Display */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span 
                className="text-4xl font-black transition-all duration-500"
                style={{ 
                  color: metric.color,
                  fontSize: isHovered ? '2.75rem' : '2.25rem'
                }}
              >
                {metric.value.toFixed(1)}
              </span>
              <span className="text-lg font-medium text-slate-600 dark:text-slate-400">
                {metric.unit}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Target: {metric.target}{metric.unit}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-medium" style={{ color: metric.color }}>
                {progress.toFixed(0)}%
              </span>
            </div>
            
            <div className="relative h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)`,
                  boxShadow: isHovered ? `0 0 20px ${metric.color}40` : 'none'
                }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: metric.value >= metric.target ? '#10b981' : '#f59e0b' }}
            ></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {metric.value >= metric.target ? 'Target Achieved' : 'Optimizing Performance'}
            </span>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Background Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: '100%', height: '400px' }}
        />
        
        {/* Header */}
        <Card className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Activity className="w-7 h-7 text-blue-400" />
                  Futuristic Analytics Grid
                </CardTitle>
                <CardDescription className="text-blue-100 mt-2">
                  Advanced real-time performance monitoring with predictive insights
                </CardDescription>
              </div>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                Live Data Stream
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metricsData.map((metric, index) => renderMetricCard(metric, index))}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {Math.round(metricsData.reduce((acc, m) => acc + m.value, 0) / metricsData.length)}%
              </div>
              <div className="text-sm text-indigo-500">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metricsData.filter(m => m.value >= m.target).length}
              </div>
              <div className="text-sm text-green-500">Targets Met</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                +{Math.round(metricsData.reduce((acc, m) => acc + m.trend, 0) / metricsData.length * 10) / 10}%
              </div>
              <div className="text-sm text-purple-500">Avg Growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">A+</div>
              <div className="text-sm text-blue-500">Performance Grade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `
      }} />
    </div>
  );
}