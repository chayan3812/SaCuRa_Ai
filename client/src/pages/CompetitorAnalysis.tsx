import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader
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

export default function CompetitorAnalysis() {
  const [pageIdInput, setPageIdInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    posts: CompetitorPost[];
    analysis: CompetitorAnalysisResult;
  } | null>(null);
  const { toast } = useToast();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Competitor Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Analyze competitor Facebook pages with AI-powered insights
          </p>
        </div>

        {/* Analysis Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analyze Competitor Page
            </CardTitle>
            <CardDescription>
              Enter a Facebook Page ID or URL to analyze their content strategy and audience engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter Facebook Page ID or URL (e.g., facebook.com/pagename)"
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
                  'Analyze Page'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* AI Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI Strategic Analysis
                </CardTitle>
                <CardDescription>
                  Generated insights based on recent Facebook posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Content Strategy</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analysisResult.analysis.strategy}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content Style</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analysisResult.analysis.contentStyle}
                    </p>
                  </div>
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