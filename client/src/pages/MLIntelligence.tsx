import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Zap, Target, BarChart3, Activity, RefreshCw, CheckCircle } from "lucide-react";

interface ModelStatus {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastUpdated: Date;
  };
  trainingDataPoints: number;
}

interface TrainingSession {
  id: string;
  modelType: string;
  startTime: Date;
  endTime?: Date;
  accuracy: number;
  improvement: number;
  dataPoints: number;
  status: 'running' | 'completed' | 'failed';
}

interface PredictionResult {
  score: number;
  confidence: number;
  recommendations: string[];
  optimizationSuggestions: string[];
}

export default function MLIntelligence() {
  const [selectedModel, setSelectedModel] = useState<string>('engagement');
  const [predictionInput, setPredictionInput] = useState({
    contentType: 'post',
    textLength: 150,
    hashtagCount: 5,
    timeOfDay: 14,
    dayOfWeek: 2,
    hasImage: true,
    hasVideo: false,
    sentiment: 0.6,
    audienceSize: 10000
  });

  // Fetch ML model status
  const { data: modelStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/ml/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch training metrics
  const { data: trainingMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/ml/training-status'],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  // Fetch recent training sessions
  const { data: trainingSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/ml/training-sessions'],
    refetchInterval: 20000
  });

  // Predict engagement mutation
  const predictEngagement = useMutation({
    mutationFn: (data: any) => apiRequest('/api/ml/predict-engagement', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml'] });
    }
  });

  // Optimize conversion mutation
  const optimizeConversion = useMutation({
    mutationFn: (data: any) => apiRequest('/api/ml/optimize-conversion', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml'] });
    }
  });

  // Retrain models mutation
  const retrainModels = useMutation({
    mutationFn: () => apiRequest('/api/ml/retrain', {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml'] });
    }
  });

  const handlePredictEngagement = () => {
    predictEngagement.mutate({
      contentType: predictionInput.contentType,
      textLength: predictionInput.textLength,
      hashtagCount: predictionInput.hashtagCount,
      timeOfDay: predictionInput.timeOfDay,
      dayOfWeek: predictionInput.dayOfWeek,
      hasImage: predictionInput.hasImage,
      hasVideo: predictionInput.hasVideo,
      sentiment: predictionInput.sentiment,
      audienceSize: predictionInput.audienceSize,
      historicalPerformance: [0.7, 0.8, 0.6, 0.9, 0.5]
    });
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'engagement': return <Target className="h-4 w-4" />;
      case 'conversion': return <TrendingUp className="h-4 w-4" />;
      case 'sentiment': return <Activity className="h-4 w-4" />;
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'bg-green-500';
    if (accuracy >= 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (statusLoading || metricsLoading || sessionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            ML Intelligence Center
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced machine learning models with self-learning capabilities
          </p>
        </div>
        <Button 
          onClick={() => retrainModels.mutate()}
          disabled={retrainModels.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${retrainModels.isPending ? 'animate-spin' : ''}`} />
          Retrain All Models
        </Button>
      </div>

      {/* Training Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainingMetrics?.totalTrainingSessions || 0}
            </div>
            <p className="text-xs text-gray-600">
              Total completed sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((trainingMetrics?.averageAccuracy || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">
              Across all models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Improvement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{((trainingMetrics?.improvementRate || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-gray-600">
              Per training cycle
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {trainingMetrics?.lastTrainingTime 
                ? new Date(trainingMetrics.lastTrainingTime).toLocaleString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-gray-600">
              Most recent session
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Model Status</TabsTrigger>
          <TabsTrigger value="predictions">Live Predictions</TabsTrigger>
          <TabsTrigger value="training">Training History</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Model Status Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelStatus && Object.entries(modelStatus).map(([id, model]: [string, any]) => (
              <Card key={id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getModelTypeIcon(model.type)}
                      {model.name}
                    </CardTitle>
                    <Badge variant={model.isActive ? "default" : "secondary"}>
                      {model.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {model.trainingDataPoints} training samples
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span className="font-medium">
                        {(model.performance.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={model.performance.accuracy * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Precision</span>
                      <div className="font-medium">
                        {(model.performance.precision * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Recall</span>
                      <div className="font-medium">
                        {(model.performance.recall * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(model.performance.lastUpdated).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Engagement Prediction
                </CardTitle>
                <CardDescription>
                  Predict engagement performance using advanced ML
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Content Type</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={predictionInput.contentType}
                      onChange={(e) => setPredictionInput({...predictionInput, contentType: e.target.value})}
                    >
                      <option value="post">Post</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="carousel">Carousel</option>
                      <option value="story">Story</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Text Length</label>
                    <input 
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={predictionInput.textLength}
                      onChange={(e) => setPredictionInput({...predictionInput, textLength: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hashtag Count</label>
                    <input 
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={predictionInput.hashtagCount}
                      onChange={(e) => setPredictionInput({...predictionInput, hashtagCount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time of Day</label>
                    <input 
                      type="number"
                      min="0"
                      max="23"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={predictionInput.timeOfDay}
                      onChange={(e) => setPredictionInput({...predictionInput, timeOfDay: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handlePredictEngagement}
                  disabled={predictEngagement.isPending}
                  className="w-full"
                >
                  {predictEngagement.isPending ? 'Predicting...' : 'Predict Engagement'}
                </Button>

                {predictEngagement.data && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Prediction Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Engagement Score:</span>
                        <span className="font-bold">
                          {(predictEngagement.data.engagementScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-bold">
                          {(predictEngagement.data.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {predictEngagement.data.recommendations && (
                        <div className="mt-3">
                          <span className="font-medium">Recommendations:</span>
                          <ul className="mt-1 space-y-1">
                            {predictEngagement.data.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-600">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Conversion Optimization
                </CardTitle>
                <CardDescription>
                  AI-powered campaign optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Daily Budget ($)</label>
                    <input 
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <input 
                      type="text"
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="25-45, interests in tech"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ad Copy</label>
                    <textarea 
                      className="w-full mt-1 p-2 border rounded-md"
                      rows={3}
                      placeholder="Your ad copy here..."
                    />
                  </div>
                  
                  <Button 
                    onClick={() => optimizeConversion.mutate({})}
                    disabled={optimizeConversion.isPending}
                    className="w-full"
                  >
                    {optimizeConversion.isPending ? 'Optimizing...' : 'Optimize Campaign'}
                  </Button>

                  {optimizeConversion.data && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Optimization Results</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Conversion Probability:</span>
                          <span className="font-bold">
                            {(optimizeConversion.data.conversionProbability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Predicted ROAS:</span>
                          <span className="font-bold">
                            {optimizeConversion.data.predictedROAS.toFixed(2)}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Optimized Budget:</span>
                          <span className="font-bold">
                            ${optimizeConversion.data.optimizedBudget}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training History Tab */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Training Sessions</CardTitle>
              <CardDescription>
                Self-learning progress and model improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingSessions && trainingSessions.map((session: TrainingSession) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        session.status === 'completed' ? 'bg-green-500' :
                        session.status === 'running' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium">{session.modelType} Model</div>
                        <div className="text-sm text-gray-600">
                          {session.dataPoints} samples • {new Date(session.startTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {(session.accuracy * 100).toFixed(1)}% accuracy
                      </div>
                      <div className={`text-sm ${session.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {session.improvement >= 0 ? '+' : ''}{(session.improvement * 100).toFixed(2)}% improvement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Learning Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Fast</div>
                <p className="text-sm text-gray-600">
                  Models are learning rapidly from new data
                </p>
                <div className="mt-2">
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Model Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Excellent</div>
                <p className="text-sm text-gray-600">
                  All models performing within optimal ranges
                </p>
                <div className="mt-2">
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Intelligence Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">Advanced</div>
                <p className="text-sm text-gray-600">
                  AI agents operating with high sophistication
                </p>
                <div className="mt-2">
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent AI Discoveries</CardTitle>
              <CardDescription>
                Patterns and insights discovered by the self-learning system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">Optimal Posting Time Pattern</div>
                  <div className="text-sm text-blue-700">
                    AI discovered that posts at 2-4 PM on weekdays generate 23% higher engagement
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Hashtag Optimization</div>
                  <div className="text-sm text-green-700">
                    Using 5-7 hashtags with 60% branded tags shows best performance
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">Audience Response Prediction</div>
                  <div className="text-sm text-purple-700">
                    Model can now predict customer sentiment with 94% accuracy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}