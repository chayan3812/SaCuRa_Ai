import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Bot, Shield, Clock } from "lucide-react";
import { DashboardMetrics } from "@/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
}

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}m`;
  };

  const cards = [
    {
      title: "Ad Spend (Today)",
      value: formatCurrency(metrics.totalSpend),
      change: "↑ 12% from yesterday",
      icon: DollarSign,
      color: "text-sacura-primary",
      bgColor: "bg-sacura-primary/10",
    },
    {
      title: "Customer Responses",
      value: metrics.totalResponses.toString(),
      change: "↑ 28% automated",
      icon: Bot,
      color: "text-sacura-secondary",
      bgColor: "bg-sacura-secondary/10",
    },
    {
      title: "Restrictions Prevented",
      value: metrics.preventedRestrictions.toString(),
      change: "↓ 67% vs last month",
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Response Time",
      value: formatTime(metrics.avgResponseTime),
      change: "AI average",
      icon: Clock,
      color: "text-sacura-accent",
      bgColor: "bg-sacura-accent/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-sacura-secondary">{card.change}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.color} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
