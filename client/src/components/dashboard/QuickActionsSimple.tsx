import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  Target,
  TrendingUp,
  Wand2,
  BarChart3,
  Zap,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuickActionsSimple() {
  const { toast } = useToast();

  const handleAction = (actionName: string) => {
    toast({
      title: "Action Triggered",
      description: `${actionName} feature activated`,
    });
  };

  const actions = [
    {
      icon: MessageSquare,
      title: "Smart Inbox",
      description: "0 messages",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      priority: "Medium",
    },
    {
      icon: Target,
      title: "AI Training",
      description: "85% accuracy",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      priority: "High",
    },
    {
      icon: TrendingUp,
      title: "View Analytics",
      description: "Performance insights",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      priority: "High",
    },
    {
      icon: Wand2,
      title: "Generate Content",
      description: "AI-powered ad copy",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      priority: "Medium",
    },
  ];

  return (
    <Card className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between text-gray-900 dark:text-gray-100">
          Quick Actions
          <Clock className="w-4 h-4 text-gray-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className="w-full justify-start p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                onClick={() => handleAction(action.title)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`${action.color} w-5 h-5`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {action.title}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Actions prioritized by usage • Live updates
          </p>
        </div>
      </CardContent>
    </Card>
  );
}