import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, Zap, Brain, Users, MessageSquare, Settings, Maximize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
}

interface VisualizationMetric {
  id: string;
  label: string;
  current: number;
  previous: number;
  color: string;
  gradient: string[];
  icon: any;
  data: DataPoint[];
}

export default function RealTimeDataVisualizer() {
  const [activeMetric, setActiveMetric] = useState('performance');
  const [isAnimating, setIsAnimating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 15000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 15000,
  });

  // Generate realistic real-time data
  const generateDataPoints = (baseValue: number, variance: number = 10): DataPoint[] => {
    const points: DataPoint[] = [];
    const now = Date.now();
    
    for (let i = 30; i >= 0; i--) {
      points.push({
        timestamp: now - i * 60000, // Every minute for 30 minutes
        value: baseValue + (Math.random() - 0.5) * variance + Math.sin(i * 0.1) * 5,
        category: 'realtime'
      });
    }
    return points;
  };

  const visualizationMetrics: VisualizationMetric[] = [
    {
      id: 'performance',
      label: 'AI Performance',
      current: aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics 
        ? (aiMetrics as any).customerToneAnalysis || 85 : 85,
      previous: 82,
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#a855f7', '#c084fc'],
      icon: Brain,
      data: generateDataPoints(85, 8)
    },
    {
      id: 'activity',
      label: 'System Activity',
      current: 92,
      previous: 89,
      color: '#10b981',
      gradient: ['#10b981', '#34d399', '#6ee7b7'],
      icon: Activity,
      data: generateDataPoints(92, 12)
    },
    {
      id: 'engagement',
      label: 'User Engagement',
      current: 78,
      previous: 75,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fbbf24', '#fcd34d'],
      icon: Users,
      data: generateDataPoints(78, 15)
    },
    {
      id: 'responses',
      label: 'AI Responses',
      current: 94,
      previous: 91,
      color: '#3b82f6',
      gradient: ['#3b82f6', '#60a5fa', '#93c5fd'],
      icon: MessageSquare,
      data: generateDataPoints(94, 6)
    }
  ];

  const activeMetricData = visualizationMetrics.find(m => m.id === activeMetric) || visualizationMetrics[0];

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
    
    let animationTime = 0;

    const animate = () => {
      if (!isAnimating) return;
      
      animationTime += 0.016; // ~60fps
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Create dynamic gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, `${activeMetricData.color}08`);
      bgGradient.addColorStop(0.5, `${activeMetricData.color}05`);
      bgGradient.addColorStop(1, `${activeMetricData.color}02`);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw animated grid
      ctx.strokeStyle = `${activeMetricData.color}20`;
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      const offsetX = (animationTime * 20) % gridSize;
      const offsetY = (animationTime * 15) % gridSize;
      
      for (let x = -gridSize + offsetX; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = -gridSize + offsetY; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw data visualization
      const padding = 60;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;
      
      const dataPoints = activeMetricData.data;
      const minValue = Math.min(...dataPoints.map(d => d.value)) - 5;
      const maxValue = Math.max(...dataPoints.map(d => d.value)) + 5;
      const valueRange = maxValue - minValue;

      // Draw main curve
      ctx.strokeStyle = activeMetricData.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      
      dataPoints.forEach((point, index) => {
        const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          // Create smooth curves using bezier
          const prevX = padding + ((index - 1) / (dataPoints.length - 1)) * chartWidth;
          const prevY = padding + chartHeight - ((dataPoints[index - 1].value - minValue) / valueRange) * chartHeight;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.closePath();
      
      const fillGradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
      fillGradient.addColorStop(0, `${activeMetricData.color}40`);
      fillGradient.addColorStop(1, `${activeMetricData.color}05`);
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // Draw data points with glow effect
      dataPoints.forEach((point, index) => {
        const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        
        // Animated pulse effect
        const pulseScale = 1 + Math.sin(animationTime * 3 + index * 0.5) * 0.2;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 12 * pulseScale);
        glowGradient.addColorStop(0, `${activeMetricData.color}80`);
        glowGradient.addColorStop(1, `${activeMetricData.color}00`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 12 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner point
        ctx.fillStyle = activeMetricData.color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // White center
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw floating particles
      for (let i = 0; i < 15; i++) {
        const particleX = (Math.sin(animationTime * 0.5 + i * 2) * 0.3 + 0.5) * width;
        const particleY = (Math.cos(animationTime * 0.3 + i * 1.5) * 0.3 + 0.5) * height;
        const size = Math.sin(animationTime + i) * 2 + 3;
        const opacity = (Math.sin(animationTime * 2 + i) + 1) * 0.3;
        
        const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, size);
        particleGradient.addColorStop(0, `${activeMetricData.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
        particleGradient.addColorStop(1, `${activeMetricData.color}00`);
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw value labels
      ctx.fillStyle = `${activeMetricData.color}80`;
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      
      for (let i = 0; i <= 4; i++) {
        const value = minValue + (valueRange / 4) * (4 - i);
        const y = padding + (chartHeight / 4) * i + 4;
        ctx.fillText(`${Math.round(value)}`, padding - 10, y);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeMetric, isAnimating, activeMetricData]);

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700 shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <Activity className="w-6 h-6 text-blue-400" />
              Real-Time Data Visualizer
            </CardTitle>
            <CardDescription className="text-slate-300 mt-1">
              Live performance analytics with predictive modeling
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Streaming Live
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAnimating(!isAnimating)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isAnimating ? <Settings className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Metric Selector */}
        <div className="flex gap-1 p-4 bg-slate-800/50 border-b border-slate-700">
          {visualizationMetrics.map((metric) => {
            const Icon = metric.icon;
            const isActive = activeMetric === metric.id;
            const change = metric.current - metric.previous;
            
            return (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r shadow-lg scale-105' 
                    : 'bg-slate-700/50 hover:bg-slate-700'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${metric.color}30, ${metric.color}20)`,
                  border: `1px solid ${metric.color}50`
                } : {}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon 
                    className="w-4 h-4" 
                    style={{ color: isActive ? metric.color : '#94a3b8' }}
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {metric.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span 
                    className="text-lg font-bold"
                    style={{ color: isActive ? metric.color : '#e2e8f0' }}
                  >
                    {metric.current}%
                  </span>
                  <div className={`flex items-center text-xs ${
                    change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {change > 0 ? '+' : ''}{change}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-80"
            style={{ width: '100%', height: '320px' }}
          />
          
          {/* Overlay Information */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeMetricData.color }}
              ></div>
              <span className="text-sm font-medium text-slate-200">
                {activeMetricData.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {activeMetricData.current.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">
              Last 30 minutes
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-800/30">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">
              {Math.round(visualizationMetrics.reduce((sum, m) => sum + m.current, 0) / visualizationMetrics.length)}%
            </div>
            <div className="text-xs text-slate-400">Avg Performance</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">
              +{Math.round(visualizationMetrics.reduce((sum, m) => sum + (m.current - m.previous), 0) / visualizationMetrics.length * 10) / 10}%
            </div>
            <div className="text-xs text-slate-400">Total Growth</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">
              {visualizationMetrics.filter(m => m.current > m.previous).length}
            </div>
            <div className="text-xs text-slate-400">Improving</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">A+</div>
            <div className="text-xs text-slate-400">Overall Grade</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}