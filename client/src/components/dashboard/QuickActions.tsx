import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  BarChart3, 
  Settings, 
  Eye,
  FileText,
  Zap,
  MessageSquare,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function QuickActions() {
  const { toast } = useToast();

  // Fetch usage data to prioritize actions
  const { data: metrics } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000,
  });

  const { data: aiMetrics } = useQuery({
    queryKey: ['/api/ai/learning-metrics'],
    refetchInterval: 30000,
  });

  const { data: customerInteractions } = useQuery({
    queryKey: ['/api/customer-service/interactions/all'],
    refetchInterval: 30000,
  });

  const handleAction = (actionName: string) => {
    toast({
      title: "Action Triggered",
      description: `${actionName} feature is being prepared...`,
    });
  };

  // Get usage-based priority for actions
  const getUsagePriority = () => {
    const hasMessages = customerInteractions && Array.isArray(customerInteractions) && customerInteractions.length > 0;
    const hasAILearning = aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics;
    const hasMetrics = metrics && typeof metrics === 'object';

    return {
      smartInbox: hasMessages ? 'high' as const : 'medium' as const,
      aiTraining: hasAILearning ? 'high' as const : 'medium' as const,
      analytics: hasMetrics ? 'high' as const : 'medium' as const,
      optimization: hasMetrics ? 'medium' as const : 'low' as const,
    };
  };

  const priority = getUsagePriority();

  const actions = [
    {
      icon: MessageSquare,
      title: "Smart Inbox",
      description: `${Array.isArray(customerInteractions) ? customerInteractions.length : 0} messages`,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      priority: priority.smartInbox,
      action: () => handleAction("Smart Inbox"),
    },
    {
      icon: Target,
      title: "AI Training",
      description: `${(aiMetrics && typeof aiMetrics === 'object' && 'customerToneAnalysis' in aiMetrics) ? aiMetrics.customerToneAnalysis : 85}% accuracy`,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      priority: priority.aiTraining,
      action: () => handleAction("AI Training"),
    },
    {
      icon: TrendingUp,
      title: "View Analytics",
      description: "Performance insights",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      priority: priority.analytics,
      action: () => handleAction("View Analytics"),
    },
    {
      icon: Wand2,
      title: "Generate Content",
      description: "AI-powered ad copy",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      priority: 'medium',
      action: () => handleAction("Generate Content"),
    },
    {
      icon: BarChart3,
      title: "Export Report",
      description: "Download data",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      priority: 'medium',
      action: () => handleAction("Export Report"),
    },
    {
      icon: Zap,
      title: "Quick Optimize",
      description: "Auto-enhance campaigns",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      priority: priority.optimization,
      action: () => handleAction("Quick Optimize"),
    },
  ];

  // Sort actions by priority
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority] ?? 1;
    const bPriority = priorityOrder[b.priority] ?? 1;
    return bPriority - aPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          Quick Actions
          <Clock className="w-4 h-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          {sortedActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className="w-full justify-start p-2 sm:p-3 h-auto hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200 touch-friendly animate-in slide-in-from-left"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={action.action}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200`}>
                    <Icon className={`${action.color} w-4 h-4 sm:w-5 sm:h-5`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{action.title}</p>
                      {getPriorityBadge(action.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Actions prioritized by usage • Updated every 30s
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
