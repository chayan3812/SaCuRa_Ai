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
  Users,
  Brain,
  Download,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  // Multi-Page Benchmarking State
  const [benchmarkPages, setBenchmarkPages] = useState(['', '', '']);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);

  // Keyword Extraction State
  const [keywordPages, setKeywordPages] = useState(['']);
  const [extractedKeywords, setExtractedKeywords] = useState<Record<string, number>>({});
  const [contentThemes, setContentThemes] = useState<string[]>([]);
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

  // Multi-Page Benchmarking Mutation
  const benchmarkPagesMutation = useMutation({
    mutationFn: async (pages: string[]) => {
      const validPages = pages.filter(page => page.trim() !== '');
      if (validPages.length < 2) {
        throw new Error('Please provide at least 2 Facebook Page IDs or URLs');
      }
      
      return apiRequest('/api/competitor/compare', {
        method: 'POST',
        body: JSON.stringify({ pages: validPages }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setBenchmarkResults(data);
      toast({
        title: "Analysis Complete",
        description: `Successfully compared ${data.validPagesCount} pages`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze pages",
        variant: "destructive",
      });
    }
  });

  // Keyword Extraction Mutation
  const keywordExtractionMutation = useMutation({
    mutationFn: async (pageIds: string[]) => {
      const validPageIds = pageIds.filter(id => id.trim() !== '');
      if (validPageIds.length === 0) {
        throw new Error('Please provide at least one Facebook Page ID');
      }
      
      return apiRequest('/api/competitor/extract-keywords', {
        method: 'POST',
        body: JSON.stringify({ pageIds: validPageIds }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setExtractedKeywords(data.keywordCounts || {});
      toast({
        title: "Keywords Extracted",
        description: `Found ${Object.keys(data.keywordCounts || {}).length} keywords from ${data.postsAnalyzed} posts`,
      });
      
      // Automatically generate content themes
      const keywords = Object.keys(data.keywordCounts || {});
      if (keywords.length > 0) {
        contentThemesMutation.mutate(keywords);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract keywords",
        variant: "destructive",
      });
    }
  });

  // Content Themes Generation Mutation
  const contentThemesMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      return apiRequest('/api/competitor/content-themes', {
        method: 'POST',
        body: JSON.stringify({ keywords }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setContentThemes(data.themes || []);
    },
    onError: (error: any) => {
      console.error('Content themes generation failed:', error);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="track" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Track Competitors
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Quick Analysis
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Benchmark Pages
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Keywords
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

          {/* Multi-Page Benchmarking Tab */}
          <TabsContent value="benchmark" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Multi-Page Benchmarking
                </CardTitle>
                <CardDescription>
                  Compare 2-3 Facebook Pages side by side with AI-powered strategic analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {benchmarkPages.map((page, index) => (
                      <Input
                        key={index}
                        placeholder={`Facebook Page ${index + 1} ID/URL`}
                        value={page}
                        onChange={(e) => {
                          const newPages = [...benchmarkPages];
                          newPages[index] = e.target.value;
                          setBenchmarkPages(newPages);
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    onClick={() => benchmarkPagesMutation.mutate(benchmarkPages)}
                    disabled={benchmarkPagesMutation.isPending}
                    className="w-full"
                  >
                    {benchmarkPagesMutation.isPending ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    {benchmarkPagesMutation.isPending ? "Analyzing..." : "Compare Pages"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benchmarking Results */}
            {benchmarkResults && (
              <div className="space-y-6">
                {/* AI Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      🧠 AI Summary (Generated on {new Date(benchmarkResults.analysis.generatedAt).toLocaleString()})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={benchmarkResults.analysis.aiSummary}
                      readOnly
                      className="min-h-[200px] text-sm leading-relaxed"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Statistics Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Page Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={benchmarkResults.analysis.stats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="pageName" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgLikes" fill="#3b82f6" name="Avg Likes" />
                        <Bar dataKey="avgComments" fill="#10b981" name="Avg Comments" />
                        <Bar dataKey="avgShares" fill="#f59e0b" name="Avg Shares" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Page Statistics Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page Name</TableHead>
                          <TableHead>Avg Likes</TableHead>
                          <TableHead>Avg Comments</TableHead>
                          <TableHead>Avg Shares</TableHead>
                          <TableHead>Engagement Rate</TableHead>
                          <TableHead>Post Frequency</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {benchmarkResults.analysis.stats.map((stat: any) => (
                          <TableRow key={stat.pageId}>
                            <TableCell className="font-medium">{stat.pageName}</TableCell>
                            <TableCell>{stat.avgLikes}</TableCell>
                            <TableCell>{stat.avgComments}</TableCell>
                            <TableCell>{stat.avgShares}</TableCell>
                            <TableCell>{stat.engagementRate}</TableCell>
                            <TableCell>
                              <Badge variant={stat.postFrequency === 'Daily+' ? 'default' : 'secondary'}>
                                {stat.postFrequency}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Top Posts Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {benchmarkResults.analysis.topPosts.map((post: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{post.pageName}</Badge>
                            <div className="text-sm text-gray-500">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm mb-2">{post.message}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post.comments}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share className="h-4 w-4" />
                              {post.shares}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Keywords Extraction Tab */}
          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keyword Heatmap Extraction
                </CardTitle>
                <CardDescription>
                  Extract trending keywords, hashtags, and marketing phrases from Facebook Pages using AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {keywordPages.map((page, index) => (
                      <Input
                        key={index}
                        placeholder={`Facebook Page ${index + 1} ID`}
                        value={page}
                        onChange={(e) => {
                          const newPages = [...keywordPages];
                          newPages[index] = e.target.value;
                          setKeywordPages(newPages);
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setKeywordPages([...keywordPages, ''])}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Page
                    </Button>
                    {keywordPages.length > 1 && (
                      <Button
                        onClick={() => setKeywordPages(keywordPages.slice(0, -1))}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={() => keywordExtractionMutation.mutate(keywordPages)}
                    disabled={keywordExtractionMutation.isPending}
                    className="w-full"
                  >
                    {keywordExtractionMutation.isPending ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Target className="mr-2 h-4 w-4" />
                    )}
                    {keywordExtractionMutation.isPending ? "Extracting Keywords..." : "Extract Keywords"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weighted Keyword Heatmap Results */}
            {Object.keys(extractedKeywords).length > 0 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Weighted Keyword Heatmap ({Object.keys(extractedKeywords).length} keywords found)
                    </CardTitle>
                    <CardDescription>
                      Trending keywords sized by frequency - larger keywords appear more often in competitor posts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.entries(extractedKeywords)
                        .sort(([,a], [,b]) => b - a) // Sort by frequency
                        .map(([keyword, frequency], index) => {
                          const maxFreq = Math.max(...Object.values(extractedKeywords));
                          const minFreq = Math.min(...Object.values(extractedKeywords));
                          const normalizedSize = minFreq === maxFreq ? 1 : (frequency - minFreq) / (maxFreq - minFreq);
                          
                          // Calculate dynamic font size (0.75rem to 2rem)
                          const fontSize = 0.75 + (normalizedSize * 1.25);
                          // Calculate color intensity (higher frequency = more intense)
                          const intensity = Math.round(50 + (normalizedSize * 50));
                          
                          return (
                            <div
                              key={keyword}
                              className="group relative"
                            >
                              <span
                                className="inline-block px-3 py-2 rounded-full bg-gradient-to-r cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 border"
                                style={{
                                  fontSize: `${fontSize}rem`,
                                  background: `linear-gradient(135deg, 
                                    hsl(220, ${intensity}%, ${95 - normalizedSize * 20}%), 
                                    hsl(280, ${intensity}%, ${90 - normalizedSize * 15}%))`,
                                  color: `hsl(220, ${intensity + 20}%, ${30 - normalizedSize * 10}%)`,
                                  borderColor: `hsl(220, ${intensity}%, ${80 - normalizedSize * 20}%)`
                                }}
                                title={`Keyword: ${keyword} (appears ${frequency} times)`}
                                onClick={() => {
                                  navigator.clipboard.writeText(keyword);
                                  toast({
                                    title: "Copied!",
                                    description: `"${keyword}" copied to clipboard`,
                                  });
                                }}
                              >
                                #{keyword.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}
                              </span>
                              {/* Enhanced Tooltip with Frequency */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                <div className="font-semibold">{keyword}</div>
                                <div className="text-gray-300">Frequency: {frequency}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Keywords sized by frequency • Click to copy • Hover for details
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const csvContent = [
                              'Keyword,Frequency,Trend_Score',
                              ...Object.entries(extractedKeywords).map(([keyword, freq]) => 
                                `"${keyword}",${freq},${Math.round((freq / Math.max(...Object.values(extractedKeywords))) * 100)}`
                              )
                            ].join('\n');
                            
                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `keyword-analysis-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                            
                            toast({
                              title: "CSV Downloaded",
                              description: "Keyword analysis exported successfully",
                            });
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          CSV Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Generate PDF report
                            const reportContent = `
                              KEYWORD ANALYSIS REPORT
                              Generated: ${new Date().toLocaleDateString()}
                              
                              TOP KEYWORDS BY FREQUENCY:
                              ${Object.entries(extractedKeywords)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 20)
                                .map(([keyword, freq], i) => `${i + 1}. ${keyword} (${freq} mentions)`)
                                .join('\n')}
                              
                              CONTENT THEMES:
                              ${contentThemes.map((theme, i) => `${i + 1}. ${theme}`).join('\n')}
                              
                              ANALYSIS SUMMARY:
                              Total Keywords: ${Object.keys(extractedKeywords).length}
                              Top Frequency: ${Math.max(...Object.values(extractedKeywords))}
                              Report ID: KWD-${Date.now()}
                            `;
                            
                            const blob = new Blob([reportContent], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `keyword-report-${new Date().toISOString().split('T')[0]}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                            
                            toast({
                              title: "Report Downloaded",
                              description: "Keyword analysis report exported successfully",
                            });
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF Report
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            // Save keywords to localStorage for AdOptimizer integration
                            const topKeywords = Object.entries(extractedKeywords)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 15)
                              .map(([keyword]) => keyword);
                            
                            localStorage.setItem('competitorKeywords', JSON.stringify({
                              keywords: topKeywords,
                              timestamp: Date.now(),
                              source: 'competitor_analysis'
                            }));
                            
                            toast({
                              title: "Keywords Ready for Ad Targeting",
                              description: `${topKeywords.length} top keywords available in Ad Optimizer`,
                            });
                          }}
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Use in Ad Targeting
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const keywordText = Object.keys(extractedKeywords).join(', ');
                            navigator.clipboard.writeText(keywordText);
                            toast({
                              title: "Copied!",
                              description: "All keywords copied to clipboard",
                            });
                          }}
                        >
                          Copy All
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Content Theme Suggestions */}
                {contentThemes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        AI Content Suggestions ({contentThemes.length} themes)
                      </CardTitle>
                      <CardDescription>
                        Content themes and post ideas generated from your keyword analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contentThemes.map((theme, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {theme}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const themesText = contentThemes.map((theme, i) => `${i + 1}. ${theme}`).join('\n');
                            navigator.clipboard.writeText(themesText);
                            toast({
                              title: "Copied!",
                              description: "Content themes copied to clipboard",
                            });
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export Content Ideas
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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