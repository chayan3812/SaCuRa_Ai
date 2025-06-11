import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  Bot, 
  ChartLine, 
  Megaphone, 
  Headphones, 
  Shield, 
  Users, 
  Search, 
  Brain,
  Settings,
  LogOut,
  Send,
  Calendar,
  BarChart3
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Ad Optimizer", href: "/ads", icon: Megaphone, badge: "AI" },
  { name: "Auto Poster", href: "/auto-poster", icon: Send, badge: "NEW" },
  { name: "Content Queue", href: "/content-queue", icon: Calendar, badge: "QUEUE" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, badge: "LIVE" },
  { name: "Page Status", href: "/page-status", icon: Shield, badge: "LIVE" },
  { name: "Customer Service", href: "/customer-service", icon: Headphones, status: "Live" },
  { name: "Restriction Monitor", href: "/restrictions", icon: Shield },
  { name: "Employee Monitor", href: "/employees", icon: Users, badge: "3" },
  { name: "Competitor Analysis", href: "/competitors", icon: Search },
  { name: "AI Insights", href: "/insights", icon: Brain },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* Brand Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sacura-primary rounded-lg flex items-center justify-center">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">SaCuRa</h1>
            <p className="text-sm text-muted-foreground">JAm AI</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-3 h-12",
                  isActive 
                    ? "bg-sacura-primary text-white hover:bg-sacura-primary/90" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-sacura-secondary text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.status && (
                  <div className="ml-auto flex items-center space-x-1">
                    <div className="w-2 h-2 bg-sacura-secondary rounded-full notification-dot"></div>
                    <span className="text-xs text-muted-foreground">{item.status}</span>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-sacura-primary flex items-center justify-center text-white font-medium">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
          <div className="flex space-x-1">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
