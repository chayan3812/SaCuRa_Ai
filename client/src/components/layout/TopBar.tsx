import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Moon, Sun, User, LogOut, Settings, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [isDark, setIsDark] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleSettingsClick = () => {
    setLocation('/settings');
  };

  const getNotificationRoute = (notification: any) => {
    switch (notification.type) {
      case 'success':
        return '/ads'; // Campaign performance alerts
      case 'warning':
        if (notification.message.includes('budget')) {
          return '/ads'; // Budget warnings
        }
        if (notification.message.includes('policy') || notification.message.includes('Page')) {
          return '/page-status'; // Page health issues
        }
        return '/analytics';
      case 'info':
        if (notification.message.includes('optimization')) {
          return '/insights'; // AI optimization results
        }
        if (notification.message.includes('competitor')) {
          return '/competitors'; // Competitor alerts
        }
        return '/analytics';
      default:
        return '/'; // Dashboard
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to appropriate page
    const route = getNotificationRoute(notification);
    setLocation(route);
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.read)?.length || 0 : 0;

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">PagePilot AI Dashboard</h2>
          <p className="text-sm text-muted-foreground">AI-powered Facebook marketing automation platform</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Real-time Status */}
          <Badge variant="secondary" className="bg-sacura-secondary/10 text-sacura-secondary hover:bg-sacura-secondary/20">
            <div className="w-2 h-2 bg-sacura-secondary rounded-full notification-dot mr-2"></div>
            AI Active
          </Badge>
          
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  (notifications as any[]).slice(0, 10).map((notification: any) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            notification.type === 'success' ? 'bg-green-100 text-green-800' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {notification.type}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
