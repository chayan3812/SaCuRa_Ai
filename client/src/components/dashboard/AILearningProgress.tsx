import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface AILearningMetrics {
  customerToneAnalysis: number;
  responseAccuracy: number;
  policyCompliance: number;
  totalInteractions: number;
}

export default function AILearningProgress() {
  const { data: metrics, isLoading } = useQuery<AILearningMetrics>({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 60000,
  });

  const learningMetrics = [
    {
      name: "Customer Tone Analysis",
      progress: metrics?.customerToneAnalysis || 0,
      color: "bg-indigo-500",
    },
    {
      name: "Response Accuracy",
      progress: metrics?.responseAccuracy || 0,
      color: "bg-sacura-secondary",
    },
    {
      name: "Policy Compliance",
      progress: metrics?.policyCompliance || 0,
      color: "bg-green-500",
    },
  ];

  const totalInteractions = metrics?.totalInteractions || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Brain className="text-indigo-600 w-4 h-4" />
            </div>
            <span>AI Learning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-12"></div>
                </div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-muted rounded mt-0.5"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted rounded w-36"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Brain className="text-indigo-600 w-4 h-4" />
          </div>
          <span>AI Learning</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {learningMetrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">{metric.name}</span>
                <span className="text-sm text-muted-foreground">{metric.progress}%</span>
              </div>
              <Progress value={metric.progress} className="h-2" />
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-start space-x-2">
              <Info className="text-indigo-600 w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-indigo-700 font-medium">
                  AI has learned from {totalInteractions.toLocaleString()} interactions this month
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Performance improves with every customer interaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
