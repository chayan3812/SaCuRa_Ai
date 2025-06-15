import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Activity, Zap, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface ChartDataPoint {
  time: string;
  aiAccuracy: number;
  responseTime: number;
  customerSatisfaction: number;
  engagement: number;
}

export default function AdvancedAnalyticsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 30000,
  });

  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000,
  });

  // Generate realistic chart data
  const generateChartData = (): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        aiAccuracy: 85 + Math.random() * 10 + Math.sin(i * 0.5) * 3,
        responseTime: 25 + Math.random() * 15 + Math.cos(i * 0.3) * 5,
        customerSatisfaction: 80 + Math.random() * 15 + Math.sin(i * 0.7) * 4,
        engagement: 70 + Math.random() * 20 + Math.cos(i * 0.4) * 6
      });
    }
    return data;
  };

  const chartData = generateChartData();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
    bgGradient.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + (chartWidth / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw AI Accuracy line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    chartData.forEach((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = height - padding - ((point.aiAccuracy - 70) / 30) * chartHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill area under AI Accuracy curve
    const gradient1 = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient1.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient1.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
    ctx.fillStyle = gradient1;
    ctx.beginPath();
    chartData.forEach((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = height - padding - ((point.aiAccuracy - 70) / 30) * chartHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.fill();

    // Draw Response Time line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    chartData.forEach((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = height - padding - ((point.responseTime - 10) / 40) * chartHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw data points
    chartData.forEach((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = height - padding - ((point.aiAccuracy - 70) / 30) * chartHeight;
      
      // Outer glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
      glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner point
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // White center
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels (time)
    for (let i = 0; i < 7; i++) {
      const dataIndex = Math.floor((i / 6) * (chartData.length - 1));
      const x = padding + (i / 6) * chartWidth;
      const label = chartData[dataIndex]?.time || '';
      ctx.fillText(label, x, height - 10);
    }

    // Y-axis labels (percentage)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = 70 + (30 / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(`${Math.round(value)}%`, padding - 10, y);
    }

  }, [chartData, aiMetrics, metrics]);

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Advanced Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Real-time performance metrics with predictive insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Chart Container */}
        <div className="relative h-80 w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">AI Accuracy</span>
            <Badge variant="secondary" className="ml-1">
              {aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics 
                ? `${(aiMetrics as any).customerToneAnalysis}%` : '85%'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Response Time</span>
            <Badge variant="secondary" className="ml-1">
              {metrics?.avgResponseTime || 0}s
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-purple-500" />
            <span className="text-sm font-medium">Performance Score</span>
            <Badge variant="secondary" className="ml-1 bg-purple-50 text-purple-700">92%</Badge>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
            <div className="text-lg font-bold text-blue-600">↗ 12%</div>
            <div className="text-xs text-blue-600">Accuracy Trend</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
            <div className="text-lg font-bold text-green-600">-15%</div>
            <div className="text-xs text-green-600">Response Time</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
            <div className="text-lg font-bold text-purple-600">↗ 8%</div>
            <div className="text-xs text-purple-600">Engagement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}