import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, BarChart3, Sparkles } from "lucide-react";

interface AutoPostConfig {
  enabled: boolean;
  threshold: number;
}

interface AutoPostStatus {
  executed: boolean;
  reason: string;
  averageScore?: number;
  timestamp: string;
}

export const AutoPostConfig: React.FC = () => {
  const [threshold, setThreshold] = useState([50]);
  const [enabled, setEnabled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["/api/facebook/auto-post/status"],
    select: (data: any) => ({
      enabled: data.enabled || false,
      threshold: data.threshold || 50
    })
  });

  // Update local state when config loads
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setThreshold([config.threshold]);
    }
  }, [config]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: { enabled: boolean; threshold: number }) => {
      return await apiRequest('/api/facebook/autopost-config', {
        method: 'POST',
        body: JSON.stringify(newConfig),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: `Auto-posting ${enabled ? 'enabled' : 'disabled'} with ${threshold[0]}% threshold`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/facebook/auto-post/status"] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save auto-post configuration",
        variant: "destructive",
      });
    }
  });

  // Generate AI preview mutation
  const previewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/facebook/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'engagement preview' }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "AI Preview Generated",
        description: "Check the preview below",
      });
    },
    onError: () => {
      toast({
        title: "Preview Failed",
        description: "Could not generate AI preview",
        variant: "destructive",
      });
    }
  });

  // Trigger manual auto-post
  const triggerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/facebook/auto-post/trigger', {
        method: 'POST'
      });
    },
    onSuccess: (data: AutoPostStatus) => {
      toast({
        title: data.executed ? "Auto-Post Executed" : "No Action Needed",
        description: data.reason,
        variant: data.executed ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Trigger Failed",
        description: "Could not trigger auto-post analysis",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate({
      enabled,
      threshold: threshold[0]
    });
  };

  const handlePreview = () => {
    previewMutation.mutate();
  };

  const handleTrigger = () => {
    triggerMutation.mutate();
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Auto-Post Engine
          </CardTitle>
          <CardDescription>
            Automatically generate and publish optimized content when post performance drops below threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Auto-Posting Status</p>
              <p className="text-xs text-gray-500">
                Enable intelligent content automation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Badge variant={enabled ? "default" : "secondary"}>
                {enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Threshold Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Performance Threshold</p>
              <Badge variant="outline">{threshold[0]}%</Badge>
            </div>
            <Slider
              value={threshold}
              onValueChange={setThreshold}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Auto-post triggers when engagement rate falls below this percentage
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSave}
              disabled={saveConfigMutation.isPending}
              className="flex-1"
            >
              {saveConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
            
            <Button 
              variant="outline"
              onClick={handlePreview}
              disabled={previewMutation.isPending}
              className="flex-1"
            >
              {previewMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Preview
            </Button>

            <Button 
              variant="secondary"
              onClick={handleTrigger}
              disabled={triggerMutation.isPending}
              className="flex-1"
            >
              {triggerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              Test Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Preview Display */}
      {previewMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI-Generated Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">
                {previewMutation.data.content}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Topic: {previewMutation.data.topic}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trigger Results Display */}
      {triggerMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto-Post Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={triggerMutation.data.executed ? "default" : "secondary"}>
                  {triggerMutation.data.executed ? "Content Published" : "No Action Taken"}
                </Badge>
                {triggerMutation.data.averageScore && (
                  <Badge variant="outline">
                    Avg Score: {triggerMutation.data.averageScore}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {triggerMutation.data.reason}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(triggerMutation.data.timestamp).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};