/**
 * Advanced Facebook Ads Management Dashboard
 * Enterprise-grade advertising management with comprehensive campaign tools
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useFacebookAdsDashboard,
  useCreateCampaign,
  useCreateAdSet,
  useCreateAd,
  useOptimizeCampaign,
  useDeleteCampaign,
  formatCurrency,
  formatPercentage,
  getCampaignStatus,
  getOptimizationRecommendations
} from "@/hooks/useFacebookAds";
import {
  Target,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Zap,
  Settings,
  Plus,
  Play,
  Pause,
  Trash2,
  BarChart3,
  Calendar,
  Globe,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react";

interface CampaignFormData {
  name: string;
  objective: string;
  daily_budget: string;
  lifetime_budget: string;
  start_time: string;
  stop_time: string;
  special_ad_categories: string[];
}

interface AdSetFormData {
  name: string;
  campaign_id: string;
  daily_budget: string;
  optimization_goal: string;
  billing_event: string;
  targeting: {
    age_min: number;
    age_max: number;
    genders: number[];
    countries: string[];
  };
}

interface AdFormData {
  name: string;
  adset_id: string;
  creative: {
    title: string;
    body: string;
    image_url: string;
    link_url: string;
    call_to_action_type: string;
  };
}

export default function FacebookAdsManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [campaignForm, setCampaignForm] = useState<CampaignFormData>({
    name: "",
    objective: "",
    daily_budget: "",
    lifetime_budget: "",
    start_time: "",
    stop_time: "",
    special_ad_categories: []
  });
  const [adSetForm, setAdSetForm] = useState<AdSetFormData>({
    name: "",
    campaign_id: "",
    daily_budget: "",
    optimization_goal: "",
    billing_event: "",
    targeting: {
      age_min: 18,
      age_max: 65,
      genders: [1, 2],
      countries: ["US"]
    }
  });
  const [adForm, setAdForm] = useState<AdFormData>({
    name: "",
    adset_id: "",
    creative: {
      title: "",
      body: "",
      image_url: "",
      link_url: "",
      call_to_action_type: "LEARN_MORE"
    }
  });

  // Facebook Ads hooks
  const adsData = useFacebookAdsDashboard();
  const createCampaign = useCreateCampaign();
  const createAdSet = useCreateAdSet();
  const createAd = useCreateAd();
  const optimizeCampaign = useOptimizeCampaign();
  const deleteCampaign = useDeleteCampaign();

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.objective) {
      toast({
        title: "Missing Information",
        description: "Campaign name and objective are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createCampaign.mutateAsync({
        name: campaignForm.name,
        objective: campaignForm.objective,
        ...(campaignForm.daily_budget && { daily_budget: campaignForm.daily_budget }),
        ...(campaignForm.lifetime_budget && { lifetime_budget: campaignForm.lifetime_budget }),
        ...(campaignForm.start_time && { start_time: campaignForm.start_time }),
        ...(campaignForm.stop_time && { stop_time: campaignForm.stop_time }),
        ...(campaignForm.special_ad_categories.length > 0 && { special_ad_categories: campaignForm.special_ad_categories })
      });

      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully",
      });

      setCampaignForm({
        name: "",
        objective: "",
        daily_budget: "",
        lifetime_budget: "",
        start_time: "",
        stop_time: "",
        special_ad_categories: []
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create campaign. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const handleCreateAdSet = async () => {
    if (!adSetForm.name || !adSetForm.campaign_id || !adSetForm.optimization_goal || !adSetForm.billing_event) {
      toast({
        title: "Missing Information",
        description: "All required fields must be filled",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAdSet.mutateAsync({
        name: adSetForm.name,
        campaign_id: adSetForm.campaign_id,
        daily_budget: adSetForm.daily_budget,
        optimization_goal: adSetForm.optimization_goal,
        billing_event: adSetForm.billing_event,
        targeting: {
          age_min: adSetForm.targeting.age_min,
          age_max: adSetForm.targeting.age_max,
          genders: adSetForm.targeting.genders,
          geo_locations: {
            countries: adSetForm.targeting.countries
          }
        }
      });

      toast({
        title: "Ad Set Created",
        description: "Your ad set has been created successfully",
      });

      setAdSetForm({
        name: "",
        campaign_id: "",
        daily_budget: "",
        optimization_goal: "",
        billing_event: "",
        targeting: {
          age_min: 18,
          age_max: 65,
          genders: [1, 2],
          countries: ["US"]
        }
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create ad set. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateAd = async () => {
    if (!adForm.name || !adForm.adset_id || !adForm.creative.title || !adForm.creative.body) {
      toast({
        title: "Missing Information",
        description: "Ad name, ad set, title, and body are required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createAd.mutateAsync(adForm);

      toast({
        title: "Ad Created",
        description: "Your ad has been created successfully",
      });

      setAdForm({
        name: "",
        adset_id: "",
        creative: {
          title: "",
          body: "",
          image_url: "",
          link_url: "",
          call_to_action_type: "LEARN_MORE"
        }
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create ad. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOptimizeCampaign = async (campaignId: string) => {
    try {
      const result = await optimizeCampaign.mutateAsync({ campaignId, performanceThreshold: 2.0 });
      
      toast({
        title: "Optimization Complete",
        description: result.reason || "Campaign optimization completed",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign.mutateAsync(campaignId);
      
      toast({
        title: "Campaign Deleted",
        description: "Campaign has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  const performance = adsData.performance.data;
  const campaigns = adsData.campaigns.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facebook Ads Manager</h1>
          <p className="text-muted-foreground">
            Advanced advertising management with AI-powered optimization
          </p>
        </div>
        <Badge variant={adsData.hasError ? 'destructive' : 'default'}>
          {adsData.hasError ? (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              Connection Issue
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </>
          )}
        </Badge>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance ? formatCurrency(performance.totalSpend) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.totalImpressions.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total reach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance ? formatPercentage(performance.averageCTR) : '0.00%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.totalConversions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create-campaign">Create Campaign</TabsTrigger>
          <TabsTrigger value="create-adset">Create Ad Set</TabsTrigger>
          <TabsTrigger value="create-ad">Create Ad</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Performance</CardTitle>
                <CardDescription>Key metrics from your ad account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Average CPC</span>
                  <span className="font-bold">
                    {performance ? formatCurrency(performance.averageCPC) : '$0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average CPM</span>
                  <span className="font-bold">
                    {performance ? formatCurrency(performance.averageCPM) : '$0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversion Rate</span>
                  <span className="font-bold">
                    {performance ? formatPercentage(performance.conversionRate) : '0.00%'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Current campaign status</CardDescription>
              </CardHeader>
              <CardContent>
                {adsData.campaigns.isLoading ? (
                  <p className="text-muted-foreground">Loading campaigns...</p>
                ) : campaigns.length > 0 ? (
                  <div className="space-y-3">
                    {campaigns.slice(0, 5).map((campaign) => {
                      const status = getCampaignStatus(campaign);
                      return (
                        <div key={campaign.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">{campaign.objective}</p>
                          </div>
                          <Badge variant={status.status === 'Active' ? 'default' : 'secondary'}>
                            {status.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No campaigns found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Manage your Facebook advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {adsData.campaigns.isLoading ? (
                <p className="text-muted-foreground">Loading campaigns...</p>
              ) : campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => {
                    const status = getCampaignStatus(campaign);
                    return (
                      <div key={campaign.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={status.status === 'Active' ? 'default' : 'secondary'}>
                              {status.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOptimizeCampaign(campaign.id)}
                              disabled={optimizeCampaign.isPending}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Optimize
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              disabled={deleteCampaign.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Objective:</span>
                            <p className="font-medium">{campaign.objective}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Daily Budget:</span>
                            <p className="font-medium">
                              {campaign.daily_budget ? formatCurrency(campaign.daily_budget) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <p className="font-medium">
                              {new Date(campaign.created_time).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Budget Remaining:</span>
                            <p className="font-medium">
                              {campaign.budget_remaining ? formatCurrency(campaign.budget_remaining) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No campaigns found</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("create-campaign")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Campaign Tab */}
        <TabsContent value="create-campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Set up a new Facebook advertising campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Enter campaign name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-objective">Objective</Label>
                  <Select onValueChange={(value) => setCampaignForm({ ...campaignForm, objective: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRAFFIC">Traffic</SelectItem>
                      <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                      <SelectItem value="REACH">Reach</SelectItem>
                      <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                      <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                      <SelectItem value="VIDEO_VIEWS">Video Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-budget">Daily Budget ($)</Label>
                  <Input
                    id="daily-budget"
                    type="number"
                    placeholder="0.00"
                    value={campaignForm.daily_budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, daily_budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lifetime-budget">Lifetime Budget ($)</Label>
                  <Input
                    id="lifetime-budget"
                    type="number"
                    placeholder="0.00"
                    value={campaignForm.lifetime_budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, lifetime_budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={campaignForm.start_time}
                    onChange={(e) => setCampaignForm({ ...campaignForm, start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stop-time">End Time</Label>
                  <Input
                    id="stop-time"
                    type="datetime-local"
                    value={campaignForm.stop_time}
                    onChange={(e) => setCampaignForm({ ...campaignForm, stop_time: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateCampaign} 
                disabled={createCampaign.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createCampaign.isPending ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Ad Set Tab */}
        <TabsContent value="create-adset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Ad Set</CardTitle>
              <CardDescription>Define targeting and budget for your ads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adset-name">Ad Set Name</Label>
                  <Input
                    id="adset-name"
                    placeholder="Enter ad set name"
                    value={adSetForm.name}
                    onChange={(e) => setAdSetForm({ ...adSetForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adset-campaign">Campaign</Label>
                  <Select onValueChange={(value) => setAdSetForm({ ...adSetForm, campaign_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adset-budget">Daily Budget ($)</Label>
                  <Input
                    id="adset-budget"
                    type="number"
                    placeholder="0.00"
                    value={adSetForm.daily_budget}
                    onChange={(e) => setAdSetForm({ ...adSetForm, daily_budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optimization-goal">Optimization Goal</Label>
                  <Select onValueChange={(value) => setAdSetForm({ ...adSetForm, optimization_goal: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select optimization goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LINK_CLICKS">Link Clicks</SelectItem>
                      <SelectItem value="IMPRESSIONS">Impressions</SelectItem>
                      <SelectItem value="REACH">Reach</SelectItem>
                      <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                      <SelectItem value="LANDING_PAGE_VIEWS">Landing Page Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing-event">Billing Event</Label>
                  <Select onValueChange={(value) => setAdSetForm({ ...adSetForm, billing_event: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMPRESSIONS">Impressions</SelectItem>
                      <SelectItem value="LINK_CLICKS">Link Clicks</SelectItem>
                      <SelectItem value="VIDEO_VIEWS">Video Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Targeting Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age-min">Minimum Age</Label>
                    <Input
                      id="age-min"
                      type="number"
                      min="13"
                      max="65"
                      value={adSetForm.targeting.age_min}
                      onChange={(e) => setAdSetForm({
                        ...adSetForm,
                        targeting: { ...adSetForm.targeting, age_min: parseInt(e.target.value) }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age-max">Maximum Age</Label>
                    <Input
                      id="age-max"
                      type="number"
                      min="13"
                      max="65"
                      value={adSetForm.targeting.age_max}
                      onChange={(e) => setAdSetForm({
                        ...adSetForm,
                        targeting: { ...adSetForm.targeting, age_max: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateAdSet} 
                disabled={createAdSet.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createAdSet.isPending ? 'Creating Ad Set...' : 'Create Ad Set'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Ad Tab */}
        <TabsContent value="create-ad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Ad</CardTitle>
              <CardDescription>Design your ad creative and copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ad-name">Ad Name</Label>
                  <Input
                    id="ad-name"
                    placeholder="Enter ad name"
                    value={adForm.name}
                    onChange={(e) => setAdForm({ ...adForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-adset">Ad Set</Label>
                  <Select onValueChange={(value) => setAdForm({ ...adForm, adset_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ad set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo_adset_1">Demo Ad Set 1</SelectItem>
                      <SelectItem value="demo_adset_2">Demo Ad Set 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Ad Creative</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="ad-title">Headline</Label>
                  <Input
                    id="ad-title"
                    placeholder="Enter compelling headline"
                    value={adForm.creative.title}
                    onChange={(e) => setAdForm({
                      ...adForm,
                      creative: { ...adForm.creative, title: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-body">Primary Text</Label>
                  <Textarea
                    id="ad-body"
                    placeholder="Write your ad copy here..."
                    value={adForm.creative.body}
                    onChange={(e) => setAdForm({
                      ...adForm,
                      creative: { ...adForm.creative, body: e.target.value }
                    })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad-image">Image URL</Label>
                    <Input
                      id="ad-image"
                      placeholder="https://example.com/image.jpg"
                      value={adForm.creative.image_url}
                      onChange={(e) => setAdForm({
                        ...adForm,
                        creative: { ...adForm.creative, image_url: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ad-link">Destination URL</Label>
                    <Input
                      id="ad-link"
                      placeholder="https://example.com"
                      value={adForm.creative.link_url}
                      onChange={(e) => setAdForm({
                        ...adForm,
                        creative: { ...adForm.creative, link_url: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta-type">Call to Action</Label>
                  <Select onValueChange={(value) => setAdForm({
                    ...adForm,
                    creative: { ...adForm.creative, call_to_action_type: value }
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select call to action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                      <SelectItem value="SHOP_NOW">Shop Now</SelectItem>
                      <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                      <SelectItem value="DOWNLOAD">Download</SelectItem>
                      <SelectItem value="GET_QUOTE">Get Quote</SelectItem>
                      <SelectItem value="CONTACT_US">Contact Us</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCreateAd} 
                disabled={createAd.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createAd.isPending ? 'Creating Ad...' : 'Create Ad'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}