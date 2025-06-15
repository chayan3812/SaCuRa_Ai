import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Share, 
  AlertTriangle,
  Target,
  BarChart3,
  Globe,
  Loader,
  Plus,
  Trash2,
  Eye,
  Calendar,
  Users
} from 'lucide-react';

interface CompetitorPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  reactions?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
  shares?: { count: number };
}

interface CompetitorAnalysisResult {
  strategy: string;
  contentStyle: string;
  audienceEngagement: string;
  postingFrequency: string;
  keyInsights: string[];
  recommendations: string[];
  strengths: string[];
  opportunities: string[];
}

interface WatchedCompetitor {
  id: string;
  pageId: string;
  pageName: string;
  category?: string;
  isActive: boolean;
  addedAt: string;
}

interface CompetitorSnapshot {
  id: string;
  pageId: string;
  followerCount: number;
  engagementRate: number;
  topPosts: string;
  insights: string;
  snapshotDate: string;
}

export default function CompetitorAnalysis() {
  const [pageIdInput, setPageIdInput] = useState('');
  const [pageNameInput, setPageNameInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    posts: CompetitorPost[];
    analysis: CompetitorAnalysisResult;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch watched competitors
  const { data: watchedCompetitors = [], isLoading: isLoadingWatched } = useQuery<WatchedCompetitor[]>({
    queryKey: ['/api/competitors/watched'],
  });

  // Add competitor to watch list
  const addCompetitorMutation = useMutation({
    mutationFn: async (data: { pageId: string; pageName: string; category?: string }) => {
      return apiRequest('/api/competitors/watch', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitors/watched'] });
      toast({
        title: "Success",
        description: "Competitor added to watch list",
      });
      setPageIdInput('');
      setPageNameInput('');
      setCategoryInput('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add competitor",
        variant: "destructive",
      });
    }
  });

  // Remove competitor from watch list
  const removeCompetitorMutation = useMutation({
    mutationFn: async (competitorId: string) => {
      return apiRequest(`/api/competitors/${competitorId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitors/watched'] });
      toast({
        title: "Success",
        description: "Competitor removed from watch list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove competitor",
        variant: "destructive",
      });
    }
  });

  // Analyze competitor posts
  const analyzePostsMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return apiRequest(`/api/competitors/${pageId}/analyze-posts`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Competitor posts analyzed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze competitor posts",
        variant: "destructive",
      });
    }
  });

  const analyzeCompetitorMutation = useMutation({
    mutationFn: async (pageId: string) => {
      return apiRequest('/api/competitor/analyze', {
        method: 'POST',
        body: JSON.stringify({ pageId })
      });
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: "Competitor analysis has been generated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze competitor page",
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    if (pageIdInput.trim()) {
      setAnalysisResult(null); // Clear previous results
      analyzeCompetitorMutation.mutate(pageIdInput.trim());
    }
  };

  const handleAddCompetitor = () => {
    if (!pageIdInput.trim() || !pageNameInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter both Page ID and Page Name",
        variant: "destructive",
      });
      return;
    }

    addCompetitorMutation.mutate({
      pageId: pageIdInput.trim(),
      pageName: pageNameInput.trim(),
      category: categoryInput.trim() || undefined
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Competitor Intelligence Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track, analyze, and gain insights from your competitors with AI-powered analysis
          </p>
        </div>

        <Tabs defaultValue="track" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Track Competitors
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Quick Analysis
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Track Competitors Tab */}
          <TabsContent value="track" className="space-y-6">
            {/* Add New Competitor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Competitor to Watch List
                </CardTitle>
                <CardDescription>
                  Monitor competitors continuously and receive regular insights about their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input
                    placeholder="Facebook Page ID"
                    value={pageIdInput}
                    onChange={(e) => setPageIdInput(e.target.value)}
                  />
                  <Input
                    placeholder="Competitor Name"
                    value={pageNameInput}
                    onChange={(e) => setPageNameInput(e.target.value)}
                  />
                  <Input
                    placeholder="Category (optional)"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddCompetitor}
                  disabled={addCompetitorMutation.isPending || !pageIdInput.trim() || !pageNameInput.trim()}
                  className="w-full md:w-auto"
                >
                  {addCompetitorMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Watch List
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Watched Competitors List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Watched Competitors ({watchedCompetitors.length})
                </CardTitle>
                <CardDescription>
                  Manage your competitor watch list and analyze their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingWatched ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : watchedCompetitors.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No competitors being watched yet.</p>
                    <p>Add competitors above to start tracking their performance.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {watchedCompetitors.map((competitor) => (
                      <div key={competitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {competitor.pageName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {competitor.pageId}
                          </p>
                          {competitor.category && (
                            <Badge variant="secondary" className="mt-1">
                              {competitor.category}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Added: {new Date(competitor.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => analyzePostsMutation.mutate(competitor.pageId)}
                            disabled={analyzePostsMutation.isPending}
                          >
                            {analyzePostsMutation.isPending ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <BarChart3 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeCompetitorMutation.mutate(competitor.id)}
                            disabled={removeCompetitorMutation.isPending}
                          >
                            {removeCompetitorMutation.isPending ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Analysis Tab */}
          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  One-Time Competitor Analysis
                </CardTitle>
                <CardDescription>
                  Quickly analyze any competitor page without adding them to your watch list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter Facebook Page ID or URL"
                    value={pageIdInput}
                    onChange={(e) => setPageIdInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzeCompetitorMutation.isPending || !pageIdInput.trim()}
                  >
                    {analyzeCompetitorMutation.isPending ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Now'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      AI Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Content Strategy</h3>
                        <p className="text-gray-600 dark:text-gray-400">{analysisResult.analysis.strategy}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Content Style</h3>
                        <p className="text-gray-600 dark:text-gray-400">{analysisResult.analysis.contentStyle}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Audience Engagement</h3>
                        <p className="text-gray-600 dark:text-gray-400">{analysisResult.analysis.audienceEngagement}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Posting Frequency</h3>
                        <p className="text-gray-600 dark:text-gray-400">{analysisResult.analysis.postingFrequency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.analysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Opportunities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Target className="h-5 w-5" />
                        Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.analysis.opportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700 dark:text-gray-300">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Top Performing Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="border rounded-lg p-4">
                          <p className="text-gray-800 dark:text-gray-200 mb-3">
                            {post.message || "No text content"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{post.reactions?.summary?.total_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.comments?.summary?.total_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share className="h-4 w-4" />
                              <span>{post.shares?.count || 0}</span>
                            </div>
                            <span className="ml-auto">{formatDate(post.created_time)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Insights Dashboard Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Competitor Performance Dashboard
                </CardTitle>
                <CardDescription>
                  Track performance trends and get strategic insights from your watched competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {watchedCompetitors.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No competitor data available yet.</p>
                    <p>Add competitors to your watch list to see performance insights.</p>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Performance insights will appear here as data is collected.</p>
                    <p>Click "Analyze" on any watched competitor to generate fresh insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
                  <div>
                    <h4 className="font-semibold mb-2">Audience Engagement</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analysisResult.analysis.audienceEngagement}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Posting Frequency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analysisResult.analysis.postingFrequency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Key Insights</h4>
                    <div className="space-y-2">
                      {analysisResult.analysis.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {analysisResult.analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Opportunities</h4>
                    <div className="space-y-2">
                      {analysisResult.analysis.opportunities.map((opp, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Globe className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Posts Analysis
                </CardTitle>
                <CardDescription>
                  Latest {analysisResult.posts.length} posts with engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.posts.map((post, index) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {post.message ? post.message.substring(0, 300) + (post.message.length > 300 ? '...' : '') : 'No message content'}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {formatDate(post.created_time)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.reactions?.summary?.total_count || 0} reactions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments?.summary?.total_count || 0} comments</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share className="h-4 w-4" />
                          <span>{post.shares?.count || 0} shares</span>
                        </div>
                        {post.permalink_url && (
                          <a 
                            href={post.permalink_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Post
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Competitor Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.analysis.strengths.map((strength, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{strength}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions for first-time users */}
        {!analysisResult && !analyzeCompetitorMutation.isPending && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Step 1: Find a Facebook Page</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find a competitor's Facebook page you want to analyze. You can use either the page ID or the full URL.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Step 2: Enter Page Information</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Copy the page URL (like facebook.com/pagename) or just the page name and paste it in the input field above.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Step 3: Get AI Insights</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI will analyze their recent posts, engagement patterns, and provide strategic recommendations for your business.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}