import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Facebook Marketing Dashboard</h2>
          <p className="text-sm text-muted-foreground">Monitor, optimize, and automate your Facebook presence</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Real-time Status */}
          <Badge variant="secondary" className="bg-sacura-secondary/10 text-sacura-secondary hover:bg-sacura-secondary/20">
            <div className="w-2 h-2 bg-sacura-secondary rounded-full notification-dot mr-2"></div>
            AI Active
          </Badge>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
