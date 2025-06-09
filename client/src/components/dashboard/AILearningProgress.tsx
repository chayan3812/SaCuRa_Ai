import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AILearningProgress() {
  // Mock data structure - in production this would come from API
  const learningMetrics = [
    {
      name: "Customer Tone Analysis",
      progress: 94,
      color: "bg-indigo-500",
    },
    {
      name: "Response Accuracy",
      progress: 89,
      color: "bg-sacura-secondary",
    },
    {
      name: "Policy Compliance",
      progress: 98,
      color: "bg-green-500",
    },
  ];

  const totalInteractions = 2847;

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
