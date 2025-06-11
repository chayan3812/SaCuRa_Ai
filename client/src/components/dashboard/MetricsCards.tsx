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

  const formatTime = (seconds: number | string) => {
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    if (isNaN(numSeconds)) return '0s';
    if (numSeconds < 60) return `${numSeconds.toFixed(1)}s`;
    return `${(numSeconds / 60).toFixed(1)}m`;
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
      <div className="grid-responsive grid-responsive-sm-2 grid-responsive-lg-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse card-responsive">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 sm:h-4 bg-muted rounded w-20 sm:w-24"></div>
                  <div className="h-6 sm:h-8 bg-muted rounded w-12 sm:w-16"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-16 sm:w-20"></div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex-shrink-0"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-responsive grid-responsive-sm-2 grid-responsive-lg-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="fade-in-up card-responsive hover:shadow-md transition-shadow duration-200" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{card.title}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">{card.value}</p>
                  <p className="text-xs sm:text-sm text-sacura-secondary truncate">{card.change}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                  <Icon className={`${card.color} w-5 h-5 sm:w-6 sm:h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
