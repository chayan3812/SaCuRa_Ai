import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Zap, 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingActionPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    { 
      icon: Plus, 
      label: "New Campaign", 
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Create new ad campaign"
    },
    { 
      icon: Bot, 
      label: "AI Assistant", 
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Get AI recommendations"
    },
    { 
      icon: MessageSquare, 
      label: "Smart Inbox", 
      color: "bg-green-500 hover:bg-green-600",
      description: "Manage customer messages"
    },
    { 
      icon: TrendingUp, 
      label: "Analytics", 
      color: "bg-orange-500 hover:bg-orange-600",
      description: "View performance metrics"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      color: "bg-gray-500 hover:bg-gray-600",
      description: "Configure platform"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "transition-all duration-500 ease-in-out transform",
        isExpanded 
          ? "scale-100 opacity-100 translate-y-0" 
          : "scale-95 opacity-95 translate-y-2"
      )}>
        <CardContent className="p-4">
          {/* Main Action Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Quick Actions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Expanded Actions */}
          <div className={cn(
            "space-y-3 transition-all duration-300 overflow-hidden",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            {quickActions.map((action, index) => (
              <div
                key={action.label}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700",
                  "hover:shadow-md transition-all duration-200 cursor-pointer",
                  "animate-in slide-in-from-right",
                  `delay-${index * 100}`
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                  "transform transition-transform duration-200 hover:scale-110",
                  action.color
                )}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Quick
                </Badge>
              </div>
            ))}
          </div>

          {/* AI Status Indicator */}
          <div className={cn(
            "mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950",
            "rounded-lg border border-blue-200 dark:border-blue-800",
            "transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Learning Active
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Processing 85% accuracy rate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}