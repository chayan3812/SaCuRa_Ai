import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wand2, 
  BarChart3, 
  Settings, 
  Eye,
  FileText,
  Zap 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  const handleAction = (actionName: string) => {
    toast({
      title: "Action Triggered",
      description: `${actionName} feature is being prepared...`,
    });
  };

  const actions = [
    {
      icon: Wand2,
      title: "Generate Ad Copy",
      description: "AI-powered content creation",
      color: "text-sacura-primary",
      bgColor: "bg-sacura-primary/10",
      action: () => handleAction("Generate Ad Copy"),
    },
    {
      icon: BarChart3,
      title: "Generate Report",
      description: "Weekly performance summary",
      color: "text-sacura-secondary",
      bgColor: "bg-sacura-secondary/10",
      action: () => handleAction("Generate Report"),
    },
    {
      icon: Settings,
      title: "AI Training",
      description: "Customize AI responses",
      color: "text-sacura-accent",
      bgColor: "bg-sacura-accent/10",
      action: () => handleAction("AI Training"),
    },
    {
      icon: Eye,
      title: "Competitor Watch",
      description: "Monitor competitor activity",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      action: () => handleAction("Competitor Watch"),
    },
    {
      icon: FileText,
      title: "Export Data",
      description: "Download analytics report",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: () => handleAction("Export Data"),
    },
    {
      icon: Zap,
      title: "Quick Optimize",
      description: "One-click campaign optimization",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      action: () => handleAction("Quick Optimize"),
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className="w-full justify-start p-2 sm:p-3 h-auto hover:bg-muted touch-friendly"
                onClick={action.action}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`${action.color} w-4 h-4 sm:w-5 sm:h-5`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{action.title}</p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
