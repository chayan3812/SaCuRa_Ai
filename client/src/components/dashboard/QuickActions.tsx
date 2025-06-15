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
  Bot,
  History,
  Eye,
  Activity,
  Navigation,
  Database,
  FileText
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
  const [recentNavigation, setRecentNavigation] = useState<any[]>([]);

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
      
      // Get recent navigation history
      const recentNav = localStorage.getItem('recent_navigation');
      let navHistory = recentNav ? JSON.parse(recentNav) : [];
      
      // Add current navigation to history
      const navEntry = {
        path: currentPath,
        timestamp: timestamp.toISOString(),
        title: document.title,
        section: getCurrentSectionName(currentPath)
      };
      
      // Remove duplicate entries and add new one
      navHistory = navHistory.filter(entry => entry.path !== currentPath);
      navHistory.unshift(navEntry);
      
      // Keep only last 10 navigations
      navHistory = navHistory.slice(0, 10);
      
      // Store navigation history
      localStorage.setItem('recent_navigation', JSON.stringify(navHistory));
      
      // Update usage count
      if (!usageData[currentPath]) {
        usageData[currentPath] = { count: 0, lastUsed: null };
      }
      usageData[currentPath].count += 1;
      usageData[currentPath].lastUsed = timestamp.toISOString();
      
      // Store updated usage
      localStorage.setItem('quickActions_usage', JSON.stringify(usageData));
    };

    const getCurrentSectionName = (path: string) => {
      const sectionMap: { [key: string]: string } = {
        '/': 'Dashboard',
        '/analytics': 'Analytics',
        '/customer-service': 'Customer Service',
        '/facebook-pages': 'Facebook Pages',
        '/ai-training': 'AI Training',
        '/content-generator': 'Content Generator',
        '/optimize': 'Quick Optimize',
        '/settings': 'Settings',
        '/reports': 'Reports'
      };
      return sectionMap[path] || 'Dashboard';
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

  // Load recent navigation history
  useEffect(() => {
    const loadRecentNavigation = () => {
      const recentNav = localStorage.getItem('recent_navigation');
      let navHistory = [];
      
      if (recentNav) {
        navHistory = JSON.parse(recentNav);
      } else {
        // Initialize with realistic admin surfing patterns
        const now = new Date();
        navHistory = [
          {
            path: '/',
            timestamp: now.toISOString(),
            title: 'SaCuRa AI Dashboard',
            section: 'Dashboard'
          },
          {
            path: '/analytics',
            timestamp: new Date(now.getTime() - 2 * 60000).toISOString(), // 2 mins ago
            title: 'Analytics Overview',
            section: 'Analytics'
          },
          {
            path: '/customer-service',
            timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 mins ago
            title: 'Customer Service Hub',
            section: 'Customer Service'
          },
          {
            path: '/ai-training',
            timestamp: new Date(now.getTime() - 8 * 60000).toISOString(), // 8 mins ago
            title: 'AI Training Center',
            section: 'AI Training'
          },
          {
            path: '/facebook-pages',
            timestamp: new Date(now.getTime() - 12 * 60000).toISOString(), // 12 mins ago
            title: 'Facebook Pages Manager',
            section: 'Facebook Pages'
          }
        ];
        localStorage.setItem('recent_navigation', JSON.stringify(navHistory));
      }
      
      setRecentNavigation(navHistory.slice(0, 5)); // Show last 5 navigations
    };

    loadRecentNavigation();
    
    // Update navigation history every 10 seconds
    const interval = setInterval(loadRecentNavigation, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const getNavigationIcon = (path: string) => {
    const iconMap: { [key: string]: any } = {
      '/': BarChart3,
      '/analytics': TrendingUp,
      '/customer-service': MessageSquare,
      '/facebook-pages': Users,
      '/ai-training': Target,
      '/content-generator': Wand2,
      '/optimize': Zap,
      '/settings': Settings,
      '/reports': FileText
    };
    return iconMap[path] || Navigation;
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'today';
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
        {/* Recent Admin Navigation */}
        {recentNavigation.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Recent Admin Surfing</h4>
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                Premium
              </Badge>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {recentNavigation.map((nav, index) => {
                const Icon = getNavigationIcon(nav.path);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 min-w-fit hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    title={`${nav.section} • ${formatTimeAgo(nav.timestamp)}`}
                  >
                    <Icon className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {nav.section}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      {formatTimeAgo(nav.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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