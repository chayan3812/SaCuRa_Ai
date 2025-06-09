import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWebSocket } from "@/lib/websocket";
import { AlertData } from "@/types";

interface Alert extends AlertData {
  id: string;
  timestamp: number;
}

export default function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const ws = getWebSocket();

    const handleAlert = (alertData: AlertData) => {
      const alert: Alert = {
        ...alertData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep max 5 alerts

      // Auto-remove after duration or 5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }, alert.duration || 5000);
    };

    ws.on('alert', handleAlert);
    ws.on('restriction-alert', (data: any) => {
      handleAlert({
        type: 'warning',
        title: 'Restriction Alert',
        message: data.message,
      });
    });
    ws.on('ai-recommendation', (data: any) => {
      handleAlert({
        type: 'info',
        title: 'New AI Recommendation',
        message: data.title,
      });
    });

    return () => {
      ws.off('alert', handleAlert);
      ws.off('restriction-alert', handleAlert);
      ws.off('ai-recommendation', handleAlert);
    };
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertStyles = (type: AlertData['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-500',
          text: 'text-green-700',
          icon: CheckCircle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-500',
          text: 'text-amber-700',
          icon: AlertTriangle,
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-500',
          text: 'text-red-700',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-500',
          text: 'text-blue-700',
          icon: Info,
        };
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const Icon = styles.icon;

        return (
          <Card
            key={alert.id}
            className={cn(
              "p-4 border-l-4 shadow-lg fade-in-up",
              styles.bg,
              styles.text
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-70 hover:opacity-100"
                onClick={() => removeAlert(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
