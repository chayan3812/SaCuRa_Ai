import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Eye, 
  MousePointer, 
  BarChart3,
  Settings,
  Play,
  Pause,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  spend_cap?: string;
  balance?: string;
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
  updated_time: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  reach?: string;
}

interface CampaignReport {
  account: AdAccount | null;
  campaigns: Campaign[];
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  avgCTR: number;
  avgCPC: number;
  avgCPM: number;
}

export default function MarketingAPI() {
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>("");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    objective: "LINK_CLICKS",
    status: "PAUSED"
  });
  const [interestQuery, setInterestQuery] = useState("");
  const { toast } = useToast();

  // Fetch ad accounts
  const { data: adAccountsData, isLoading: adAccountsLoading } = useQuery({
    queryKey: ["/api/marketing/ad-accounts"],
    enabled: true
  });

  // Fetch campaigns for selected ad account
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/marketing/campaigns", selectedAdAccount],
    enabled: !!selectedAdAccount
  });

  // Fetch campaign report
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["/api/marketing/campaign-report", selectedAdAccount],
    enabled: !!selectedAdAccount
  });

  // Fetch interest suggestions
  const { data: interestData, isLoading: interestLoading } = useQuery({
    queryKey: ["/api/marketing/interest-suggestions", { query: interestQuery }],
    enabled: !!interestQuery && interestQuery.length > 2
  });

  // Validate Marketing API token
  const { data: tokenValidation } = useQuery({
    queryKey: ["/api/marketing/validate-token"]
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: typeof newCampaign) => {
      if (!selectedAdAccount) throw new Error("No ad account selected");
      return apiRequest(`/api/marketing/create-campaign/${selectedAdAccount}`, {
        method: "POST",
        body: JSON.stringify(campaignData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully",
      });
      setNewCampaign({ name: "", objective: "LINK_CLICKS", status: "PAUSED" });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update campaign status mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: string; status: string }) => {
      return apiRequest(`/api/marketing/campaign-status/${campaignId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Campaign status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const adAccounts = adAccountsData?.adAccounts || [];
  const campaigns = campaignsData?.campaigns || [];
  const report = reportData?.report as CampaignReport;
  const interests = interestData?.suggestions || [];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-500';
      case 'PAUSED': return 'bg-yellow-500';
      case 'DELETED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAccountStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 2: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing API</h1>
          <p className="text-muted-foreground">
            Advanced Facebook Marketing API integration for campaign management and insights
          </p>
        </div>
        {tokenValidation?.validation?.isValid && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Token Valid
          </Badge>
        )}
      </div>

      {/* Token Status Alert */}
      {tokenValidation?.validation && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Marketing API Token: {tokenValidation.validation.isValid ? "Valid" : "Invalid"} | 
            Scopes: {tokenValidation.validation.scopes?.join(", ") || "None"} | 
            App ID: {tokenValidation.validation.appId}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="accounts">Ad Accounts</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
        </TabsList>

        {/* Ad Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ad Accounts
              </CardTitle>
              <CardDescription>
                Manage your Facebook Ad Accounts with Marketing API access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adAccountsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {adAccounts.map((account: AdAccount) => (
                    <div
                      key={account.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAdAccount === account.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAdAccount(account.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAccountStatusIcon(account.account_status)}
                          <div>
                            <h3 className="font-medium">{account.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {account.id} • {account.currency} • {account.timezone_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {account.balance && (
                            <p className="text-sm font-medium">
                              Balance: {account.currency} {account.balance}
                            </p>
                          )}
                          {account.spend_cap && (
                            <p className="text-xs text-muted-foreground">
                              Spend Cap: {account.currency} {account.spend_cap}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {adAccounts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No ad accounts found. Ensure your Marketing API token has proper permissions.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaigns
                {selectedAdAccount && (
                  <Badge variant="outline">{campaigns.length} total</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {selectedAdAccount ? "Manage campaigns for selected ad account" : "Select an ad account to view campaigns"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedAdAccount ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select an ad account from the Accounts tab first
                </div>
              ) : campaignsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: Campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(campaign.status)}`} />
                          <div>
                            <h3 className="font-medium">{campaign.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {campaign.objective} • Created: {new Date(campaign.created_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{campaign.status}</Badge>
                          <div className="flex gap-1">
                            {campaign.status === 'PAUSED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCampaignMutation.mutate({
                                  campaignId: campaign.id,
                                  status: 'ACTIVE'
                                })}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            {campaign.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCampaignMutation.mutate({
                                  campaignId: campaign.id,
                                  status: 'PAUSED'
                                })}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {(campaign.spend || campaign.impressions || campaign.clicks) && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                          {campaign.spend && (
                            <div>
                              <p className="text-muted-foreground">Spend</p>
                              <p className="font-medium">${campaign.spend}</p>
                            </div>
                          )}
                          {campaign.impressions && (
                            <div>
                              <p className="text-muted-foreground">Impressions</p>
                              <p className="font-medium">{parseInt(campaign.impressions).toLocaleString()}</p>
                            </div>
                          )}
                          {campaign.clicks && (
                            <div>
                              <p className="text-muted-foreground">Clicks</p>
                              <p className="font-medium">{parseInt(campaign.clicks).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No campaigns found for this ad account
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {!selectedAdAccount ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Please select an ad account to view insights
                </div>
              </CardContent>
            </Card>
          ) : reportLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="h-8 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-6 bg-gray-100 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : report ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                        <p className="text-2xl font-bold">${report.totalSpend.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                        <p className="text-2xl font-bold">{report.totalImpressions.toLocaleString()}</p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                        <p className="text-2xl font-bold">{report.totalClicks.toLocaleString()}</p>
                      </div>
                      <MousePointer className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg CTR</p>
                        <p className="text-2xl font-bold">{report.avgCTR.toFixed(2)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average CPC</span>
                        <span className="font-medium">${report.avgCPC.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average CPM</span>
                        <span className="font-medium">${report.avgCPM.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Campaigns</span>
                        <span className="font-medium">{report.campaigns.filter(c => c.status === 'ACTIVE').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Campaigns</span>
                        <span className="font-medium">{report.campaigns.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.account && (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Name</span>
                          <span className="font-medium">{report.account.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Currency</span>
                          <span className="font-medium">{report.account.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Timezone</span>
                          <span className="font-medium">{report.account.timezone_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <div className="flex items-center gap-2">
                            {getAccountStatusIcon(report.account.account_status)}
                            <span className="font-medium">
                              {report.account.account_status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No insights data available for this account
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Interest Targeting Research
              </CardTitle>
              <CardDescription>
                Search for interests and behaviors to target in your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="interest-search">Search Interests</Label>
                <Input
                  id="interest-search"
                  value={interestQuery}
                  onChange={(e) => setInterestQuery(e.target.value)}
                  placeholder="Enter keywords to find interests (e.g., fitness, travel, technology)"
                />
              </div>

              {interestLoading && interestQuery && (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              )}

              {interests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Interest Suggestions ({interests.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {interests.map((interest: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{interest.name}</h5>
                            <p className="text-sm text-muted-foreground">ID: {interest.id}</p>
                          </div>
                          {interest.audience_size_lower_bound && (
                            <Badge variant="outline">
                              {interest.audience_size_lower_bound.toLocaleString()} - {interest.audience_size_upper_bound.toLocaleString()} people
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {interestQuery && !interestLoading && interests.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No interests found for "{interestQuery}"
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Campaign Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Create New Campaign
              </CardTitle>
              <CardDescription>
                {selectedAdAccount ? "Create a new campaign for the selected ad account" : "Select an ad account first"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedAdAccount ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select an ad account from the Accounts tab first
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newCampaign.name && newCampaign.objective) {
                      createCampaignMutation.mutate(newCampaign);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="campaign-objective">Campaign Objective *</Label>
                    <Select
                      value={newCampaign.objective}
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, objective: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LINK_CLICKS">Link Clicks</SelectItem>
                        <SelectItem value="POST_ENGAGEMENT">Post Engagement</SelectItem>
                        <SelectItem value="PAGE_LIKES">Page Likes</SelectItem>
                        <SelectItem value="REACH">Reach</SelectItem>
                        <SelectItem value="TRAFFIC">Traffic</SelectItem>
                        <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                        <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                        <SelectItem value="MESSAGES">Messages</SelectItem>
                        <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="campaign-status">Initial Status</Label>
                    <Select
                      value={newCampaign.status}
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={createCampaignMutation.isPending || !newCampaign.name || !newCampaign.objective}
                    className="w-full"
                  >
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}