import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FeedbackReplayPanel from "@/components/FeedbackReplayPanel";
import {
  Bot,
  Package,
  Play,
  RefreshCw,
  GitBranch,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Code,
  FileText,
  Zap,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Activity
} from "lucide-react";

interface AIVersion {
  id: string;
  versionTag: string;
  description: string;
  fineTuneId?: string;
  modelConfig: any;
  trainingDataCount: number;
  performanceMetrics: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StressTestResult {
  totalProcessed: number;
  averageImprovement: number;
  categoriesProcessed: Record<string, number>;
  averageProcessingTime: number;
  testResults: Array<{
    testCase: any;
    correctedReply: string;
    scoreImprovement: number;
    processingTime: number;
    timestamp: string;
  }>;
}

export default function AIVersionManager() {
  const { toast } = useToast();
  const [newVersionData, setNewVersionData] = useState({
    versionTag: "",
    description: "",
    fineTuneId: "",
  });
  const [stressBatchSize, setStressBatchSize] = useState(10);
  const [selectedVersion, setSelectedVersion] = useState<AIVersion | null>(null);

  // Fetch AI versions
  const { data: versions, isLoading: versionsLoading } = useQuery<AIVersion[]>({
    queryKey: ["/api/ai/versions"],
    refetchInterval: 30000,
  });

  // Fetch active version
  const { data: activeVersion } = useQuery<AIVersion>({
    queryKey: ["/api/ai/active-version"],
    refetchInterval: 30000,
  });

  // Fetch test report
  const { data: testReport } = useQuery<{ report: string }>({
    queryKey: ["/api/ai/test-report"],
  });

  // Create new version mutation
  const createVersion = useMutation({
    mutationFn: async (versionData: typeof newVersionData) => {
      return await apiRequest("/api/ai/create-version", {
        method: "POST",
        body: JSON.stringify(versionData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Version Created",
        description: data.message,
      });
      setNewVersionData({ versionTag: "", description: "", fineTuneId: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/versions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/active-version"] });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Unable to create new AI version",
        variant: "destructive",
      });
    },
  });

  // Run stress test mutation
  const runStressTest = useMutation({
    mutationFn: async (batchSize: number) => {
      return await apiRequest("/api/ai/run-stress-test", {
        method: "POST",
        body: JSON.stringify({ batchSize }),
      });
    },
    onSuccess: (data: StressTestResult) => {
      toast({
        title: "Stress Test Complete",
        description: `Processed ${data.totalProcessed} test cases with ${data.averageImprovement} average improvement`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/test-report"] });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Unable to run stress test",
        variant: "destructive",
      });
    },
  });

  // Detect model drift mutation
  const detectDrift = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/ai/detect-drift", {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Drift Analysis Complete",
        description: data.driftDetected ? "Model drift detected" : "No drift detected",
        variant: data.driftDetected ? "destructive" : "default",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to detect model drift",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getVersionStatus = (version: AIVersion) => {
    if (version.isActive) return { label: "Active", color: "bg-green-100 text-green-800" };
    if (version.fineTuneId) return { label: "Fine-tuned", color: "bg-blue-100 text-blue-800" };
    return { label: "Standard", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <GitBranch className="w-10 h-10 text-purple-600" />
            AI Version Manager & Feedback Loop
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Versioned, trainable, auto-correcting AI assistant management
          </p>
        </div>

        {/* Active Version Status */}
        {activeVersion && (
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">
                    Active Version: {activeVersion.versionTag}
                  </h3>
                  <p className="text-green-700">{activeVersion.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                    <span>Training Data: {activeVersion.trainingDataCount} examples</span>
                    <span>Created: {formatDate(activeVersion.createdAt)}</span>
                  </div>
                </div>
              </div>
              {activeVersion.fineTuneId && (
                <Badge className="bg-purple-100 text-purple-800">
                  Fine-tuned: {activeVersion.fineTuneId}
                </Badge>
              )}
            </div>
          </Card>
        )}

        <Tabs defaultValue="versions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="versions">Version Management</TabsTrigger>
            <TabsTrigger value="stress-test">Stress Testing</TabsTrigger>
            <TabsTrigger value="feedback-replay">Feedback Replay</TabsTrigger>
            <TabsTrigger value="prompt-comparison">Prompt Comparison</TabsTrigger>
            <TabsTrigger value="drift-analysis">Drift Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="versions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create New Version */}
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Version
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version Tag
                    </label>
                    <Input
                      value={newVersionData.versionTag}
                      onChange={(e) => setNewVersionData(prev => ({ 
                        ...prev, 
                        versionTag: e.target.value 
                      }))}
                      placeholder="e.g., v2.0, v2.1-beta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={newVersionData.description}
                      onChange={(e) => setNewVersionData(prev => ({ 
                        ...prev, 
                        description: e.target.value 
                      }))}
                      placeholder="Describe improvements and changes..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fine-tune ID (Optional)
                    </label>
                    <Input
                      value={newVersionData.fineTuneId}
                      onChange={(e) => setNewVersionData(prev => ({ 
                        ...prev, 
                        fineTuneId: e.target.value 
                      }))}
                      placeholder="ft-xxx from OpenAI"
                    />
                  </div>

                  <Button
                    onClick={() => createVersion.mutate(newVersionData)}
                    disabled={!newVersionData.versionTag || !newVersionData.description || createVersion.isPending}
                    className="w-full"
                  >
                    {createVersion.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4 mr-2" />
                    )}
                    Create Version
                  </Button>
                </div>
              </Card>

              {/* Version List */}
              <div className="lg:col-span-2">
                <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Version History</h3>

                  {versionsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {versions?.map((version) => {
                        const status = getVersionStatus(version);
                        return (
                          <div
                            key={version.id}
                            className={`p-4 rounded-lg border ${
                              version.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <GitBranch className="w-5 h-5 text-gray-600" />
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {version.versionTag}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {version.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {formatDate(version.createdAt)}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {version.trainingDataCount} examples
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedVersion(version)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stress-test">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Failure Stress Testing
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Size
                    </label>
                    <Input
                      type="number"
                      value={stressBatchSize}
                      onChange={(e) => setStressBatchSize(Number(e.target.value))}
                      min={1}
                      max={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of simulated failures to process (1-100)
                    </p>
                  </div>

                  <Button
                    onClick={() => runStressTest.mutate(stressBatchSize)}
                    disabled={runStressTest.isPending}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    size="lg"
                  >
                    {runStressTest.isPending ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    Run Stress Test
                  </Button>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Test Categories</h4>
                        <div className="mt-1 text-sm text-yellow-800 space-y-1">
                          <p>• Empathy failures (lack of understanding)</p>
                          <p>• Specificity issues (vague responses)</p>
                          <p>• Completeness problems (missing information)</p>
                          <p>• Accuracy errors (incorrect facts)</p>
                          <p>• Tone mismatches (inappropriate responses)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Test Results
                </h3>

                {testReport ? (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded-lg border overflow-x-auto">
                      {testReport.report}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No test results available</p>
                    <p className="text-sm">Run a stress test to see results</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback-replay">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                AI vs Agent Feedback Replay
              </h3>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  This section demonstrates the FeedbackReplayPanel component that allows side-by-side 
                  comparison of AI replies vs agent corrections, with automatic improvement generation.
                </p>
              </div>

              {/* Sample interaction for demonstration */}
              <FeedbackReplayPanel
                interaction={{
                  id: "demo-interaction",
                  message: "My payment failed three times and I'm really frustrated!",
                  aiReply: "Thank you for contacting us. We'll look into it.",
                  agentReply: "I understand your frustration with the payment failures. Let me check your account immediately and resolve this for you right now.",
                  feedback: "no",
                  timestamp: new Date().toISOString(),
                  assistantVersion: activeVersion?.versionTag || "v1.0"
                }}
                onUpdate={() => {
                  toast({
                    title: "Demo Update",
                    description: "In production, this would update the interaction data",
                  });
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="prompt-comparison">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Prompt Version Comparison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Original Prompt (v1.0)</h4>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-red-800">
{`You are a customer service assistant.

Respond to customer inquiries professionally.

Customer: {message}

Reply:`}
                    </pre>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Generic • Low specificity
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Retrained Prompt (v2.0)</h4>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-green-800">
{`You are a customer service assistant. Based on past failures, this type of query often fails due to: "{failureCategory}"

So be especially careful to avoid issues in that area.

Guidelines:
- Show empathy for frustrated customers
- Provide specific, actionable solutions
- Include relevant details and next steps
- Match the urgency of the customer's tone

Customer: {message}

Reply:`}
                    </pre>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Context-aware • Failure-informed
                  </Badge>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Key Improvements</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Dynamic failure category awareness</li>
                  <li>• Specific empathy and tone guidelines</li>
                  <li>• Actionable solution requirements</li>
                  <li>• Context-driven response adaptation</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="drift-analysis">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Model Drift Detection
              </h3>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <Button
                    onClick={() => detectDrift.mutate()}
                    disabled={detectDrift.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    size="lg"
                  >
                    {detectDrift.isPending ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Activity className="w-5 h-5 mr-2" />
                    )}
                    Analyze Model Drift
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900">Performance Tracking</h4>
                    <p className="text-sm text-green-700">Monitor response quality over time</p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-medium text-yellow-900">Drift Detection</h4>
                    <p className="text-sm text-yellow-700">Identify when retraining is needed</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <Settings className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-900">Auto-Optimization</h4>
                    <p className="text-sm text-blue-700">Continuous model improvement</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Version Details Modal */}
        {selectedVersion && (
          <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Version Details: {selectedVersion.versionTag}</DialogTitle>
                <DialogDescription>
                  Complete information about this AI assistant version
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm">
                      <Badge className={getVersionStatus(selectedVersion).color}>
                        {getVersionStatus(selectedVersion).label}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Training Data</label>
                    <p className="text-sm">{selectedVersion.trainingDataCount} examples</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600">{selectedVersion.description}</p>
                </div>

                {selectedVersion.fineTuneId && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fine-tune ID</label>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {selectedVersion.fineTuneId}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm">{formatDate(selectedVersion.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Updated</label>
                    <p className="text-sm">{formatDate(selectedVersion.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}