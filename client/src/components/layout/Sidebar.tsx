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
  BarChart3,
  X
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Ad Optimizer", href: "/ads", icon: Megaphone, badge: "AI" },
  { name: "Auto Poster", href: "/auto-poster", icon: Send, badge: "NEW" },
  { name: "Content Queue", href: "/content-queue", icon: Calendar, badge: "QUEUE" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, badge: "LIVE" },
  { name: "Page Status", href: "/page-status", icon: Shield, badge: "LIVE" },
  { name: "Customer Service", href: "/customer-service", icon: Headphones, status: "Live" },
  { name: "SmartInbox AI", href: "/smart-inbox", icon: Bot, badge: "AI" },
  { name: "Restriction Monitor", href: "/restrictions", icon: Shield },
  { name: "Employee Monitor", href: "/employees", icon: Users, badge: "3" },
  { name: "Competitor Analysis", href: "/competitors", icon: Search },
  { name: "AI Insights", href: "/insights", icon: Brain },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg">
      {/* Brand Header with Mobile Close Button */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sacura-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SaCuRa</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">JAm AI</p>
            </div>
          </div>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-8 h-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} onClick={handleLinkClick}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-2 sm:space-x-3 h-10 sm:h-12 text-sm sm:text-base",
                  isActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-blue-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                )}
                {item.status && (
                  <div className="ml-auto flex items-center space-x-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{item.status}</span>
                  </div>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User Profile" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pro Plan</p>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <Link href="/settings" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon" className="w-7 h-7 sm:w-8 sm:h-8">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-7 h-7 sm:w-8 sm:h-8"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
