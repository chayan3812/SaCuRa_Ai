import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket, DollarSign, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Post {
  id: string;
  message?: string;
  created_time: string;
}

interface BoostPostRequest {
  pagePostId: string;
  budget: number;
  days: number;
}

export const BoostPostPanel: React.FC = () => {
  const [selectedPostId, setSelectedPostId] = useState("");
  const [budget, setBudget] = useState(10);
  const [days, setDays] = useState(3);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Facebook posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/facebook/posts'],
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });

  const posts = postsData?.data || [];

  // Boost post mutation
  const boostMutation = useMutation({
    mutationFn: async (data: BoostPostRequest) => {
      return apiRequest('/api/facebook/boost-post', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Post Boosted Successfully",
        description: `Campaign created with ID: ${response.campaignId}. Campaign is paused - activate it in Facebook Ads Manager.`,
      });
      // Reset form
      setSelectedPostId("");
      setBudget(10);
      setDays(3);
    },
    onError: (error: any) => {
      toast({
        title: "Boost Failed",
        description: error.message || "Failed to boost post. Please check your Facebook Ads configuration.",
        variant: "destructive",
      });
    },
  });

  const handleBoost = () => {
    if (!selectedPostId) {
      toast({
        title: "Post Required",
        description: "Please select a post to boost.",
        variant: "destructive",
      });
      return;
    }

    if (budget < 1) {
      toast({
        title: "Invalid Budget",
        description: "Daily budget must be at least $1.",
        variant: "destructive",
      });
      return;
    }

    if (days < 1) {
      toast({
        title: "Invalid Duration",
        description: "Campaign duration must be at least 1 day.",
        variant: "destructive",
      });
      return;
    }

    boostMutation.mutate({
      pagePostId: selectedPostId,
      budget,
      days,
    });
  };

  const totalBudget = budget * days;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          Boost Facebook Post
        </CardTitle>
        <CardDescription>
          Create advertising campaigns to boost your existing Facebook posts with targeted reach and engagement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Post Selection */}
        <div className="space-y-2">
          <Label htmlFor="post-select">Select Post to Boost</Label>
          <Select value={selectedPostId} onValueChange={setSelectedPostId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a recent Facebook post" />
            </SelectTrigger>
            <SelectContent>
              {postsLoading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading posts...
                  </div>
                </SelectItem>
              ) : posts.length === 0 ? (
                <SelectItem value="no-posts" disabled>
                  No posts available
                </SelectItem>
              ) : (
                posts.map((post: Post) => (
                  <SelectItem 
                    key={post.id} 
                    value={post.id.split("_")[1] || post.id}
                  >
                    {post.message?.slice(0, 60) || "Untitled Post"} 
                    {post.message && post.message.length > 60 && "..."}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Budget Input */}
        <div className="space-y-2">
          <Label htmlFor="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Daily Budget (USD)
          </Label>
          <Input
            id="budget"
            type="number"
            min="1"
            max="1000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            placeholder="Enter daily budget"
          />
          <p className="text-sm text-muted-foreground">
            Minimum $1 per day
          </p>
        </div>

        {/* Duration Input */}
        <div className="space-y-2">
          <Label htmlFor="days" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Campaign Duration (Days)
          </Label>
          <Input
            id="days"
            type="number"
            min="1"
            max="30"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="Enter duration in days"
          />
          <p className="text-sm text-muted-foreground">
            1-30 days recommended
          </p>
        </div>

        {/* Budget Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Budget:</span>
            <span className="text-lg font-bold text-blue-600">
              ${totalBudget.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ${budget}/day × {days} day{days !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Boost Button */}
        <Button
          onClick={handleBoost}
          disabled={boostMutation.isPending || !selectedPostId}
          className="w-full"
          size="lg"
        >
          {boostMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Campaign...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Boost Post Now
            </>
          )}
        </Button>

        {/* Information */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Campaigns are created in PAUSED status for review</p>
          <p>• Activate campaigns in Facebook Ads Manager</p>
          <p>• Requires valid Facebook Ad Account ID configuration</p>
        </div>
      </CardContent>
    </Card>
  );
};