import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Moon, Sun, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function TopBar() {
  const [isDark, setIsDark] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user } = useAuth();

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const unreadCount = notifications?.filter((n: any) => !n.read)?.length || 0;

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
          <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
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
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 10).map((notification: any) => (
                    <DropdownMenuItem key={notification.id} className="p-4 cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
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
              <DropdownMenuItem>
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
