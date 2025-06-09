import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Clock,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AIRecommendation } from "@/types";

export default function AIInsights() {
  const { data: recommendations = [] } = useQuery<AIRecommendation[]>({
    queryKey: ['/api/dashboard/recommendations'],
  });

  // Mock AI insights data - in production this would come from API
  const insights = {
    performance: {
      score: 87,
      trend: "+12%",
      factors: [
        { name: "Content Quality", score: 92, impact: "High" },
        { name: "Posting Frequency", score: 78, impact: "Medium" },
        { name: "Engagement Rate", score: 85, impact: "High" },
        { name: "Audience Growth", score: 91, impact: "Medium" },
      ]
    },
    predictions: [
      {
        metric: "Engagement Rate",
        current: "3.4%",
        predicted: "4.1%",
        confidence: 89,
        timeframe: "Next 30 days",
        factors: ["Improved content timing", "Trending hashtags"]
      },
      {
        metric: "Follower Growth",
        current: "1.2K/month",
        predicted: "1.8K/month",
        confidence: 76,
        timeframe: "Next month",
        factors: ["Video content increase", "Better targeting"]
      },
      {
        metric: "Ad Performance",
        current: "2.3% CTR",
        predicted: "3.1% CTR",
        confidence: 82,
        timeframe: "Next campaign",
        factors: ["AI-optimized copy", "Better audience targeting"]
      },
    ],
    opportunities: [
      {
        title: "Optimal Posting Time",
        description: "Post at 2:30 PM on Wednesdays for 34% higher engagement",
        impact: "High",
        effort: "Low",
        category: "Timing"
      },
      {
        title: "Video Content Gap",
        description: "Increase video content by 40% to match top performers",
        impact: "High",
        effort: "Medium",
        category: "Content"
      },
      {
        title: "Audience Expansion",
        description: "Target 'Digital Marketing Enthusiasts' segment",
        impact: "Medium",
        effort: "Low",
        category: "Targeting"
      },
      {
        title: "Competitor Strategy",
        description: "Adopt carousel format used by top competitor",
        impact: "Medium",
        effort: "Low",
        category: "Format"
      },
    ]
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      default: return 'text-green-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'timing': return Clock;
      case 'content': return Target;
      case 'targeting': return Users;
      case 'format': return BarChart3;
      default: return Lightbulb;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Insights</h1>
              <p className="text-muted-foreground">Advanced analytics and predictive recommendations</p>
            </div>
            <Badge variant="secondary" className="bg-sacura-primary/10 text-sacura-primary">
              <Brain className="w-4 h-4 mr-1" />
              AI Powered
            </Badge>
          </div>

          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-sacura-primary" />
                <span>AI Performance Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-4xl font-bold text-foreground">{insights.performance.score}</span>
                    <span className="text-xl text-muted-foreground">/100</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {insights.performance.trend} this month
                    </Badge>
                  </div>
                </div>
                <div className="w-32 h-32 bg-gradient-to-r from-sacura-primary to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{insights.performance.score}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.performance.factors.map((factor, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{factor.name}</span>
                      <Badge 
                        variant="outline" 
                        className={getImpactColor(factor.impact)}
                      >
                        {factor.impact} Impact
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={factor.score} className="flex-1" />
                      <span className="text-sm font-medium text-foreground">{factor.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-sacura-secondary" />
                <span>AI Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {insights.predictions.map((prediction, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{prediction.metric}</h4>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {prediction.confidence}% confident
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current</span>
                        <span className="text-sm font-medium">{prediction.current}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Predicted</span>
                        <span className="text-sm font-medium text-sacura-secondary">{prediction.predicted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Timeframe</span>
                        <span className="text-sm font-medium">{prediction.timeframe}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Key factors:</p>
                      <ul className="text-xs text-muted-foreground">
                        {prediction.factors.map((factor, i) => (
                          <li key={i}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Growth Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-sacura-accent" />
                <span>Growth Opportunities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {insights.opportunities.map((opportunity, index) => {
                  const CategoryIcon = getCategoryIcon(opportunity.category);
                  return (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-5 h-5 text-sacura-primary" />
                          <h4 className="font-semibold text-foreground">{opportunity.title}</h4>
                        </div>
                        <Badge variant="outline" className={getImpactColor(opportunity.impact)}>
                          {opportunity.impact}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-muted-foreground">Effort:</span>
                            <span className={`text-xs font-medium ${getEffortColor(opportunity.effort)}`}>
                              {opportunity.effort}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {opportunity.category}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          Apply
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                <span>Active AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>All recommendations have been implemented!</p>
                  <p className="text-sm">Check back later for new AI insights.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={
                              recommendation.priority === 'high' ? 'destructive' : 
                              recommendation.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {recommendation.priority} priority
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {recommendation.type}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">{recommendation.title}</h4>
                          <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Dismiss
                          </Button>
                          <Button size="sm">
                            Implement
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Learning Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Learning Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">2,847</h4>
                  <p className="text-sm text-muted-foreground">Interactions Analyzed</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">94%</h4>
                  <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">127</h4>
                  <p className="text-sm text-muted-foreground">Optimizations Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
