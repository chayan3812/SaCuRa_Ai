import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RefreshCw, 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Zap,
  Eye,
  PlayCircle
} from "lucide-react";

interface AIReplayData {
  id: string;
  messageId: string;
  originalMessage: string;
  aiReply: string;
  agentOverride: string;
  rejectionReason: string;
  rejectionAnalysis: string;
  timestamp: Date;
  customerName: string;
  confidence: number;
  isSelected: boolean;
}

export default function AdminAIReplay() {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'rejected' | 'approved'>('rejected');

  const { data: replayData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/ai-replay', filterType],
    queryFn: () => apiRequest(`/api/admin/ai-replay?filter=${filterType}`),
  });

  const retrainMutation = useMutation({
    mutationFn: async (items: string[]) => {
      return apiRequest('/api/admin/retrain', {
        method: 'POST',
        body: JSON.stringify({ replayIds: items }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Retraining Initiated",
        description: `Added ${selectedItems.size} examples to training queue. Model will be updated in background.`,
      });
      setSelectedItems(new Set());
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Retraining Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (replayData) {
      setSelectedItems(new Set(replayData.map((item: AIReplayData) => item.id)));
    }
  };

  const clearAll = () => {
    setSelectedItems(new Set());
  };

  const handleRetrain = () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one replay to retrain on.",
      });
      return;
    }
    retrainMutation.mutate(Array.from(selectedItems));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading AI replay data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Replay Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Side-by-side comparison of AI suggestions vs agent overrides for training
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="w-4 h-4 mr-1" />
            AI Evolution Memory
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Training Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Filter:</label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'rejected' | 'approved')}
                  className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Replays</option>
                  <option value="rejected">Rejected Only</option>
                  <option value="approved">Approved Only</option>
                </select>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleRetrain}
              disabled={selectedItems.size === 0 || retrainMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {retrainMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Retrain on Selected ({selectedItems.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replay Items */}
      <div className="space-y-6">
        {replayData?.map((item: AIReplayData) => (
          <Card key={item.id} className={`${selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.customerName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-gray-50">
                    Confidence: {(item.confidence * 100).toFixed(1)}%
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Original Message */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Customer Message:
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm">{item.originalMessage}</p>
                </div>
              </div>

              {/* Side-by-side Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Reply */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h4 className="font-medium text-red-700 dark:text-red-400">
                      AI Suggestion (Rejected)
                    </h4>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.aiReply}
                    </p>
                  </div>
                  {item.rejectionReason && (
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded">
                      <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-400">
                        {item.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Agent Override */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-medium text-green-700 dark:text-green-400">
                      Agent Override (Approved)
                    </h4>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.agentOverride}
                    </p>
                  </div>
                  {item.rejectionAnalysis && (
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
                      <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                        Analysis:
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {item.rejectionAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-4">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!replayData || replayData.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PlayCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Replay Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {filterType === 'rejected' 
                ? 'No rejected AI suggestions found. Try changing the filter or generate some customer interactions first.' 
                : 'No replay data found for the selected filter.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}