import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Brain,
  Target,
  Activity,
  BarChart3
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

interface SLAMetrics {
  responseTime: {
    avg: number;
    max: number;
    slaCompliance: number;
    target: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  confidence: {
    avg: number;
    slaCompliance: number;
    target: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  approvalRate: {
    rate: number;
    approved: number;
    rejected: number;
    total: number;
    target: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  overallStatus: string;
}

interface FailurePattern {
  reason: string;
  count: number;
}

interface ConfidenceDrift {
  dailyTrend: Array<{
    date: string;
    avgConfidence: number;
    replyCount: number;
  }>;
  drift: {
    trend: 'improving' | 'declining' | 'stable';
    drift: number;
    driftPercentage: number;
    recent: number;
    baseline: number;
  };
  alerts: Array<{
    severity: 'high' | 'medium' | 'low';
    message: string;
    action: string;
  }>;
}

export default function SLADashboard() {
  const [timeframe, setTimeframe] = useState("7");
  const [driftTimeframe, setDriftTimeframe] = useState("14");
  const [failureTimeframe, setFailureTimeframe] = useState("30");

  // SLA Metrics Query
  const { data: slaMetrics, isLoading: slaLoading } = useQuery({
    queryKey: ['/api/sla/metrics', timeframe],
  });

  // Failure Patterns Query
  const { data: failurePatterns, isLoading: failureLoading } = useQuery({
    queryKey: ['/api/sla/failure-patterns', failureTimeframe],
  });

  // Confidence Drift Query
  const { data: confidenceDrift, isLoading: driftLoading } = useQuery({
    queryKey: ['/api/sla/confidence-drift', driftTimeframe],
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
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SLA Dashboard</h1>
          <p className="text-muted-foreground">AI performance monitoring and failure analysis</p>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall SLA Status</CardTitle>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {getStatusIcon(slaMetrics?.overallStatus || 'healthy')}
            <span className={`text-xl font-semibold ${getStatusColor(slaMetrics?.overallStatus || 'healthy')}`}>
              {slaMetrics?.overallStatus?.toUpperCase() || 'HEALTHY'}
            </span>
            <Badge variant="outline">
              Last {timeframe} days
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* SLA Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {slaMetrics?.responseTime?.avg?.toFixed(0) || 0}ms
                </span>
                {getStatusIcon(slaMetrics?.responseTime?.status || 'healthy')}
              </div>
              <Progress 
                value={(slaMetrics?.responseTime?.slaCompliance || 0) * 100} 
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                SLA Compliance: {((slaMetrics?.responseTime?.slaCompliance || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {slaMetrics?.responseTime?.target || 5000}ms | Max: {slaMetrics?.responseTime?.max?.toFixed(0) || 0}ms
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {((slaMetrics?.confidence?.avg || 0) * 100).toFixed(1)}%
                </span>
                {getStatusIcon(slaMetrics?.confidence?.status || 'healthy')}
              </div>
              <Progress 
                value={(slaMetrics?.confidence?.slaCompliance || 0) * 100} 
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                SLA Compliance: {((slaMetrics?.confidence?.slaCompliance || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {((slaMetrics?.confidence?.target || 0.8) * 100).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {((slaMetrics?.approvalRate?.rate || 0) * 100).toFixed(1)}%
                </span>
                {getStatusIcon(slaMetrics?.approvalRate?.status || 'healthy')}
              </div>
              <Progress 
                value={(slaMetrics?.approvalRate?.rate || 0) * 100} 
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Approved: {slaMetrics?.approvalRate?.approved || 0} | Rejected: {slaMetrics?.approvalRate?.rejected || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {((slaMetrics?.approvalRate?.target || 0.85) * 100).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Drift Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Confidence Drift Analysis</CardTitle>
              <Select value={driftTimeframe} onValueChange={setDriftTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              {confidenceDrift?.drift?.trend && (
                <div className="flex items-center space-x-2">
                  {confidenceDrift.drift.trend === 'improving' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : confidenceDrift.drift.trend === 'declining' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="capitalize">{confidenceDrift.drift.trend} trend</span>
                  <Badge variant="outline">
                    {confidenceDrift.drift.drift > 0 ? '+' : ''}{(confidenceDrift.drift.drift * 100).toFixed(2)}%
                  </Badge>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {confidenceDrift?.dailyTrend && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={confidenceDrift.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip 
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Confidence']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgConfidence" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Failure Patterns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Failure Patterns</CardTitle>
              <Select value={failureTimeframe} onValueChange={setFailureTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Distribution of AI reply failure reasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {failurePatterns?.reasonDistribution && failurePatterns.reasonDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={failurePatterns.reasonDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {failurePatterns.reasonDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No failure data available for the selected timeframe
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drift Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Alerts</CardTitle>
            <CardDescription>Automated performance drift detection</CardDescription>
          </CardHeader>
          <CardContent>
            {confidenceDrift?.alerts && confidenceDrift.alerts.length > 0 ? (
              <div className="space-y-3">
                {confidenceDrift.alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                      alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {alert.severity === 'high' ? (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : alert.severity === 'medium' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Action: {alert.action.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p>All systems operating normally</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Failures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Failures</CardTitle>
            <CardDescription>Latest AI reply failures requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {failurePatterns?.recentFailures && failurePatterns.recentFailures.length > 0 ? (
              <div className="space-y-3">
                {failurePatterns.recentFailures.slice(0, 5).map((failure: any) => (
                  <div key={failure.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="destructive" className="text-xs">
                        {failure.failureReason || 'Unknown'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(failure.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{failure.originalMessage}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Confidence: {((failure.analysisConfidence || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p>No recent failures to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      {failurePatterns?.insights && (
        <Card>
          <CardHeader>
            <CardTitle>AI Performance Insights</CardTitle>
            <CardDescription>Automated analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {failurePatterns.totalFailures || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Failures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {failurePatterns.insights.topFailureReason || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Top Issue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {failurePatterns.insights.impactPercentage?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Impact Rate</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Improvement Opportunity: {failurePatterns.insights.improvementOpportunity || 'Continue monitoring'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}