import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AIRecommendation } from "@/types";

export default function AIRecommendations() {
  const { data: recommendations = [], isLoading } = useQuery<AIRecommendation[]>({
    queryKey: ['/api/dashboard/recommendations'],
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-indigo-600 w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 sm:p-4 bg-muted rounded-lg animate-pulse">
                <div className="h-3 sm:h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-2 sm:h-3 bg-muted-foreground/20 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return TrendingUp;
      case 'timing':
        return Clock;
      case 'content':
        return AlertTriangle;
      default:
        return Lightbulb;
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100',
      'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100',
      'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100',
    ];
    return gradients[index % gradients.length];
  };

  const getIconColor = (index: number) => {
    const colors = ['text-indigo-600', 'text-green-600', 'text-amber-600'];
    return colors[index % colors.length];
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="text-indigo-600 w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <span>AI Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Lightbulb className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No new recommendations available.</p>
              <p className="text-xs sm:text-sm">Check back later for AI insights.</p>
            </div>
          ) : (
            recommendations.slice(0, 3).map((recommendation, index) => {
              const Icon = getIcon(recommendation.type);
              return (
                <div
                  key={recommendation.id}
                  className={`p-3 sm:p-4 rounded-lg border ${getGradient(index)}`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Icon className={`${getIconColor(index)} mt-0.5 sm:mt-1 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        {recommendation.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
