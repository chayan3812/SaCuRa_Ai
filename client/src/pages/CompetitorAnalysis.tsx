import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  TrendingUp, 
  Users, 
  Heart,
  MessageCircle,
  Share,
  BarChart3,
  Plus,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CompetitorAnalysis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Mock competitor data - in production this would come from API
  const competitors = [
    {
      id: 1,
      name: "Social Media Pro",
      pageId: "socialmediapro",
      followers: 45200,
      avgEngagement: 3.2,
      postsPerWeek: 5,
      topContentType: "Video",
      lastScanned: "2 hours ago",
      isTracking: true,
    },
    {
      id: 2,
      name: "Marketing Mastery",
      pageId: "marketingmastery",
      followers: 38500,
      avgEngagement: 2.8,
      postsPerWeek: 7,
      topContentType: "Carousel",
      lastScanned: "4 hours ago",
      isTracking: true,
    },
    {
      id: 3,
      name: "Digital Growth Hub",
      pageId: "digitalgrowth",
      followers: 52300,
      avgEngagement: 4.1,
      postsPerWeek: 4,
      topContentType: "Image",
      lastScanned: "1 hour ago",
      isTracking: false,
    },
  ];

  const insights = [
    {
      type: "trending",
      title: "Video Content Surge",
      description: "Competitors are posting 40% more video content this month",
      impact: "High",
      action: "Consider increasing video production",
    },
    {
      type: "timing",
      title: "Optimal Posting Times",
      description: "Best performing posts are between 2-4 PM on weekdays",
      impact: "Medium",
      action: "Adjust your posting schedule",
    },
    {
      type: "hashtags",
      title: "Emerging Hashtags",
      description: "#MarketingTips and #SmallBusiness trending in your niche",
      impact: "Medium",
      action: "Incorporate trending hashtags",
    },
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Search Complete",
        description: `Found potential competitors for "${searchQuery}"`,
      });
    }, 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
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
              <h1 className="text-3xl font-bold text-foreground">Competitor Analysis</h1>
              <p className="text-muted-foreground">Monitor and analyze competitor activity to stay ahead</p>
            </div>
            <Badge variant="secondary" className="bg-sacura-primary/10 text-sacura-primary">
              <Eye className="w-4 h-4 mr-1" />
              Monitoring {competitors.filter(c => c.isTracking).length} Competitors
            </Badge>
          </div>

          {/* Search and Add Competitors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Find Competitors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter competitor page name or URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Search for Facebook pages in your industry to track their performance and strategies
              </p>
            </CardContent>
          </Card>

          {/* Competitor Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tracked Competitors</p>
                    <p className="text-2xl font-bold text-foreground">{competitors.filter(c => c.isTracking).length}</p>
                    <p className="text-sm text-sacura-secondary">Active monitoring</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                    <p className="text-2xl font-bold text-foreground">3.4%</p>
                    <p className="text-sm text-sacura-secondary">Industry average</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="text-green-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Top Content Type</p>
                    <p className="text-2xl font-bold text-foreground">Video</p>
                    <p className="text-sm text-sacura-secondary">Most engaging</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-purple-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Posting Frequency</p>
                    <p className="text-2xl font-bold text-foreground">5.3</p>
                    <p className="text-sm text-sacura-secondary">Posts per week</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-amber-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competitor List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Competitor Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitors.map((competitor) => (
                  <div key={competitor.id} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {competitor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-foreground">{competitor.name}</h4>
                            {competitor.isTracking && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Tracking
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{competitor.pageId}</p>
                          <p className="text-xs text-muted-foreground">Last scanned: {competitor.lastScanned}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Followers</p>
                          <p className="text-lg font-bold text-foreground">{formatNumber(competitor.followers)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                          <p className="text-lg font-bold text-sacura-secondary">{competitor.avgEngagement}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Posts/Week</p>
                          <p className="text-lg font-bold text-foreground">{competitor.postsPerWeek}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Top Content</p>
                          <p className="text-sm font-bold text-purple-600">{competitor.topContentType}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant={competitor.isTracking ? "destructive" : "default"} 
                            size="sm"
                          >
                            {competitor.isTracking ? "Stop" : "Track"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-sacura-primary" />
                <span>AI Market Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getImpactColor(insight.impact)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {insight.type}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <p className="text-sm font-medium text-sacura-primary">
                          Recommended Action: {insight.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Video", engagement: 4.2, change: "+12%" },
                    { type: "Carousel", engagement: 3.8, change: "+8%" },
                    { type: "Image", engagement: 3.1, change: "+3%" },
                    { type: "Text", engagement: 2.4, change: "-2%" },
                  ].map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{content.type}</p>
                        <p className="text-sm text-muted-foreground">{content.engagement}% avg engagement</p>
                      </div>
                      <Badge 
                        variant={content.change.startsWith('+') ? 'secondary' : 'destructive'}
                        className={content.change.startsWith('+') ? 'bg-green-100 text-green-700' : ''}
                      >
                        {content.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trending Hashtags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { tag: "#MarketingTips", usage: 89, trend: "up" },
                    { tag: "#SmallBusiness", usage: 76, trend: "up" },
                    { tag: "#SocialMediaStrategy", usage: 64, trend: "up" },
                    { tag: "#DigitalMarketing", usage: 58, trend: "down" },
                    { tag: "#BusinessGrowth", usage: 45, trend: "up" },
                  ].map((hashtag, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sacura-primary">{hashtag.tag}</p>
                        <p className="text-sm text-muted-foreground">Used {hashtag.usage} times this week</p>
                      </div>
                      <TrendingUp 
                        className={`w-4 h-4 ${
                          hashtag.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
