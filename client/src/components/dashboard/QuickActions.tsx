import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare,
  Target,
  TrendingUp,
  Wand2,
  BarChart3,
  Zap,
  Clock,
  Users,
  Settings,
  Bot
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  priority: "High" | "Medium" | "Low";
  lastUsed?: Date;
  usageCount: number;
  route?: string;
}

export default function QuickActions() {
  const { toast } = useToast();
  const [recentActions, setRecentActions] = useState<UserAction[]>([]);

  // Fetch user activity data
  const { data: interactions } = useQuery({
    queryKey: ["/api/customer-service/interactions/all"],
    refetchInterval: 30000,
  });

  const { data: aiMetrics } = useQuery({
    queryKey: ["/api/ai/learning-metrics"],
    refetchInterval: 30000,
  });

  const { data: dashboardMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000,
  });

  // Track page navigation and feature usage
  useEffect(() => {
    const trackUsage = () => {
      const currentPath = window.location.pathname;
      const timestamp = new Date();
      
      // Get stored usage data
      const storedUsage = localStorage.getItem('quickActions_usage');
      let usageData = storedUsage ? JSON.parse(storedUsage) : {};
      
      // Update usage count
      if (!usageData[currentPath]) {
        usageData[currentPath] = { count: 0, lastUsed: null };
      }
      usageData[currentPath].count += 1;
      usageData[currentPath].lastUsed = timestamp.toISOString();
      
      // Store updated usage
      localStorage.setItem('quickActions_usage', JSON.stringify(usageData));
    };

    trackUsage();
  }, []);

  // Generate actions based on actual usage and data
  useEffect(() => {
    const generateSmartActions = () => {
      const actions: UserAction[] = [];
      const storedUsage = localStorage.getItem('quickActions_usage');
      const usageData = storedUsage ? JSON.parse(storedUsage) : {};

      // Smart Inbox - Priority based on message count
      const messageCount = interactions?.length || 0;
      const inboxPriority = messageCount > 5 ? "High" : messageCount > 0 ? "Medium" : "Low";
      actions.push({
        id: "smart-inbox",
        title: "Smart Inbox",
        description: `${messageCount} messages`,
        icon: MessageSquare,
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        priority: inboxPriority,
        usageCount: usageData["/customer-service"]?.count || 0,
        lastUsed: usageData["/customer-service"]?.lastUsed ? new Date(usageData["/customer-service"].lastUsed) : undefined,
        route: "/customer-service"
      });

      // AI Training - Priority based on accuracy
      const aiAccuracy = aiMetrics?.customerToneAnalysis || 85;
      const trainingPriority = aiAccuracy < 80 ? "High" : aiAccuracy < 90 ? "Medium" : "Low";
      actions.push({
        id: "ai-training",
        title: "AI Training",
        description: `${aiAccuracy}% accuracy`,
        icon: Target,
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        priority: trainingPriority,
        usageCount: usageData["/ai-training"]?.count || 0,
        lastUsed: usageData["/ai-training"]?.lastUsed ? new Date(usageData["/ai-training"].lastUsed) : undefined,
        route: "/ai-training"
      });

      // Analytics - Always high priority for business insights
      const totalSpend = dashboardMetrics?.totalSpend || "0";
      actions.push({
        id: "analytics",
        title: "View Analytics",
        description: `${totalSpend} spend tracked`,
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        priority: "High",
        usageCount: usageData["/analytics"]?.count || 0,
        lastUsed: usageData["/analytics"]?.lastUsed ? new Date(usageData["/analytics"].lastUsed) : undefined,
        route: "/analytics"
      });

      // Content Generator - Medium priority utility
      actions.push({
        id: "content-generator",
        title: "Generate Content",
        description: "AI-powered ad copy",
        icon: Wand2,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        priority: "Medium",
        usageCount: usageData["/content-generator"]?.count || 0,
        lastUsed: usageData["/content-generator"]?.lastUsed ? new Date(usageData["/content-generator"].lastUsed) : undefined,
        route: "/content-generator"
      });

      // Facebook Pages - Priority based on connection status
      const pagesPriority = dashboardMetrics?.totalResponses > 0 ? "Medium" : "High";
      actions.push({
        id: "facebook-pages",
        title: "Facebook Pages",
        description: "Manage connected pages",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        priority: pagesPriority,
        usageCount: usageData["/facebook-pages"]?.count || 0,
        lastUsed: usageData["/facebook-pages"]?.lastUsed ? new Date(usageData["/facebook-pages"].lastUsed) : undefined,
        route: "/facebook-pages"
      });

      // Quick Optimize - Auto-enhancement feature
      actions.push({
        id: "quick-optimize",
        title: "Quick Optimize",
        description: "Auto-enhance campaigns",
        icon: Zap,
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        priority: "Medium",
        usageCount: usageData["/optimize"]?.count || 0,
        lastUsed: usageData["/optimize"]?.lastUsed ? new Date(usageData["/optimize"].lastUsed) : undefined,
        route: "/optimize"
      });

      // Sort by priority and recent usage
      const sortedActions = actions.sort((a, b) => {
        // First by priority
        const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by usage count
        const usageDiff = b.usageCount - a.usageCount;
        if (usageDiff !== 0) return usageDiff;
        
        // Finally by last used date
        if (a.lastUsed && b.lastUsed) {
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        }
        return 0;
      });

      setRecentActions(sortedActions.slice(0, 4));
    };

    generateSmartActions();
  }, [interactions, aiMetrics, dashboardMetrics]);

  const handleActionClick = (action: UserAction) => {
    // Track the action usage
    const storedUsage = localStorage.getItem('quickActions_usage');
    let usageData = storedUsage ? JSON.parse(storedUsage) : {};
    
    if (!usageData[action.route || action.id]) {
      usageData[action.route || action.id] = { count: 0, lastUsed: null };
    }
    usageData[action.route || action.id].count += 1;
    usageData[action.route || action.id].lastUsed = new Date().toISOString();
    
    localStorage.setItem('quickActions_usage', JSON.stringify(usageData));

    // Show feedback
    toast({
      title: "Action Triggered",
      description: `${action.title} feature activated`,
    });

    // Navigate if route exists
    if (action.route) {
      // In a real app, you'd use router navigation here
      console.log(`Navigating to: ${action.route}`);
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "secondary";
    }
  };

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
          {recentActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                onClick={() => handleActionClick(action)}
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
                      <Badge variant={getPriorityVariant(action.priority)} className="text-xs">
                        {action.priority}
                      </Badge>
                      {action.usageCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {action.usageCount}x
                        </Badge>
                      )}
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
            Actions prioritized by usage • Updates in real-time
          </p>
        </div>
      </CardContent>
    </Card>
  );
}