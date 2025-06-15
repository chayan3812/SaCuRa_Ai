import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Target, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  MousePointer,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Settings,
  TestTube,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from "lucide-react";

interface ConversionMetrics {
  totalConversions: number;
  conversionValue: number;
  conversionRate: number;
  costPerConversion: number;
  averageOrderValue: number;
  topConvertingEvents: Array<{
    eventName: string;
    count: number;
    totalValue: number;
    conversionRate: number;
  }>;
}

interface AttributionModel {
  firstClick: number;
  lastClick: number;
  linear: number;
  timeDecay: number;
  positionBased: number;
  dataDeiven: number;
}

export default function FacebookConversions() {
  const { toast } = useToast();
  const [testEventData, setTestEventData] = useState({
    eventName: "Purchase",
    userData: {
      email_address: "test@example.com",
      external_id: "test_user_123"
    },
    customData: {
      value: 99.99,
      currency: "USD",
      content_name: "Test Product"
    }
  });

  const [audienceData, setAudienceData] = useState({
    name: "",
    description: "",
    events: ["Purchase"],
    timeWindow: 30,
    minValue: 0
  });

  // Query conversion metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/conversions/metrics'],
    retry: false
  });

  // Query attribution analysis
  const { data: attribution, isLoading: attributionLoading } = useQuery({
    queryKey: ['/api/conversions/attribution-analysis'],
    retry: false
  });

  // Test conversion setup
  const testSetupMutation = useMutation({
    mutationFn: () => apiRequest('/api/conversions/test-setup', { method: 'POST' }),
    onSuccess: (data) => {
      toast({
        title: "Setup Test Complete",
        description: data.testResults.isValid ? "All tests passed!" : "Some tests failed",
        variant: data.testResults.isValid ? "default" : "destructive"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to test conversion setup",
        variant: "destructive"
      });
    }
  });

  // Track custom event
  const trackEventMutation = useMutation({
    mutationFn: (eventData: any) => apiRequest('/api/conversions/track-event', {
      method: 'POST',
      body: eventData
    }),
    onSuccess: () => {
      toast({
        title: "Event Tracked",
        description: "Conversion event sent to Facebook successfully"
      });
      refetchMetrics();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to track conversion event",
        variant: "destructive"
      });
    }
  });

  // Create custom audience
  const createAudienceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/conversions/create-audience', {
      method: 'POST',
      body: data
    }),
    onSuccess: (data) => {
      toast({
        title: "Audience Created",
        description: `Custom audience "${data.audience.name}" created with ${data.audience.size} users`
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create custom audience",
        variant: "destructive"
      });
    }
  });

  // Optimize conversions
  const optimizeMutation = useMutation({
    mutationFn: () => apiRequest('/api/conversions/optimize', { method: 'POST' }),
    onSuccess: (data) => {
      toast({
        title: "Optimization Complete",
        description: `Found ${data.optimization.recommendations.length} optimization opportunities`
      });
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facebook Conversions API</h1>
          <p className="text-muted-foreground">Advanced conversion tracking and optimization</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => testSetupMutation.mutate()}
            disabled={testSetupMutation.isPending}
            variant="outline"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Setup
          </Button>
          <Button 
            onClick={() => refetchMetrics()}
            disabled={metricsLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Track Events</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsLoading ? "..." : (metrics?.metrics?.totalConversions || 0).toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsLoading ? "..." : formatCurrency(metrics?.metrics?.conversionValue || 0)}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsLoading ? "..." : `${(metrics?.metrics?.conversionRate || 0).toFixed(2)}%`}
                </div>
                <div className="flex items-center text-xs text-red-600">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -2.1% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metricsLoading ? "..." : formatCurrency(metrics?.metrics?.averageOrderValue || 0)}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +5.8% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Converting Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Converting Events
              </CardTitle>
              <CardDescription>
                Events driving the most conversions and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(metrics?.metrics?.topConvertingEvents || []).slice(0, 5).map((event: any, index: number) => (
                    <div key={event.eventName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{event.eventName}</p>
                          <p className="text-sm text-muted-foreground">{event.count} conversions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(event.totalValue)}</p>
                        <p className="text-sm text-muted-foreground">{event.conversionRate.toFixed(2)}% rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Track Custom Event */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Track Custom Event
                </CardTitle>
                <CardDescription>
                  Send conversion events to Facebook Pixel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Select 
                    value={testEventData.eventName} 
                    onValueChange={(value) => setTestEventData({...testEventData, eventName: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Contact">Contact</SelectItem>
                      <SelectItem value="ViewContent">View Content</SelectItem>
                      <SelectItem value="AddToCart">Add To Cart</SelectItem>
                      <SelectItem value="InitiateCheckout">Initiate Checkout</SelectItem>
                      <SelectItem value="CompleteRegistration">Complete Registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">User Email</Label>
                    <Input
                      id="user-email"
                      value={testEventData.userData.email_address}
                      onChange={(e) => setTestEventData({
                        ...testEventData,
                        userData: { ...testEventData.userData, email_address: e.target.value }
                      })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-id">External User ID</Label>
                    <Input
                      id="user-id"
                      value={testEventData.userData.external_id}
                      onChange={(e) => setTestEventData({
                        ...testEventData,
                        userData: { ...testEventData.userData, external_id: e.target.value }
                      })}
                      placeholder="user_123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-value">Value</Label>
                    <Input
                      id="event-value"
                      type="number"
                      value={testEventData.customData.value}
                      onChange={(e) => setTestEventData({
                        ...testEventData,
                        customData: { ...testEventData.customData, value: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="99.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={testEventData.customData.currency} 
                      onValueChange={(value) => setTestEventData({
                        ...testEventData,
                        customData: { ...testEventData.customData, currency: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-name">Content Name</Label>
                  <Input
                    id="content-name"
                    value={testEventData.customData.content_name}
                    onChange={(e) => setTestEventData({
                      ...testEventData,
                      customData: { ...testEventData.customData, content_name: e.target.value }
                    })}
                    placeholder="Product Name"
                  />
                </div>

                <Button 
                  onClick={() => trackEventMutation.mutate(testEventData)}
                  disabled={trackEventMutation.isPending}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {trackEventMutation.isPending ? "Tracking..." : "Track Event"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Quick Track Events
                </CardTitle>
                <CardDescription>
                  Common conversion events with preset data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => trackEventMutation.mutate({
                    eventName: "ViewContent",
                    userData: { external_id: "demo_user" },
                    customData: { content_name: "Product Page", value: 0, currency: "USD" }
                  })}
                  disabled={trackEventMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Track Page View
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => trackEventMutation.mutate({
                    eventName: "AddToCart",
                    userData: { external_id: "demo_user" },
                    customData: { content_name: "Demo Product", value: 29.99, currency: "USD" }
                  })}
                  disabled={trackEventMutation.isPending}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Track Add to Cart
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => trackEventMutation.mutate({
                    eventName: "Purchase",
                    userData: { external_id: "demo_user", email_address: "customer@example.com" },
                    customData: { content_name: "Demo Purchase", value: 99.99, currency: "USD", order_id: `order_${Date.now()}` }
                  })}
                  disabled={trackEventMutation.isPending}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Track Purchase
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => trackEventMutation.mutate({
                    eventName: "Lead",
                    userData: { external_id: "demo_user", email_address: "lead@example.com" },
                    customData: { content_name: "Newsletter Signup", value: 0, currency: "USD" }
                  })}
                  disabled={trackEventMutation.isPending}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Track Lead
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audiences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Create Custom Audience
              </CardTitle>
              <CardDescription>
                Build targeted audiences based on conversion events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience-name">Audience Name</Label>
                  <Input
                    id="audience-name"
                    value={audienceData.name}
                    onChange={(e) => setAudienceData({...audienceData, name: e.target.value})}
                    placeholder="High-Value Customers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-window">Time Window (days)</Label>
                  <Input
                    id="time-window"
                    type="number"
                    value={audienceData.timeWindow}
                    onChange={(e) => setAudienceData({...audienceData, timeWindow: parseInt(e.target.value) || 30})}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience-description">Description</Label>
                <Textarea
                  id="audience-description"
                  value={audienceData.description}
                  onChange={(e) => setAudienceData({...audienceData, description: e.target.value})}
                  placeholder="Users who made a purchase in the last 30 days..."
                />
              </div>

              <div className="space-y-2">
                <Label>Conversion Events</Label>
                <div className="flex flex-wrap gap-2">
                  {["Purchase", "Lead", "Contact", "ViewContent", "AddToCart"].map((event) => (
                    <Button
                      key={event}
                      variant={audienceData.events.includes(event) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const events = audienceData.events.includes(event)
                          ? audienceData.events.filter(e => e !== event)
                          : [...audienceData.events, event];
                        setAudienceData({...audienceData, events});
                      }}
                    >
                      {event}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-value">Minimum Value (optional)</Label>
                <Input
                  id="min-value"
                  type="number"
                  value={audienceData.minValue}
                  onChange={(e) => setAudienceData({...audienceData, minValue: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <Button 
                onClick={() => createAudienceMutation.mutate(audienceData)}
                disabled={createAudienceMutation.isPending || !audienceData.name}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                {createAudienceMutation.isPending ? "Creating..." : "Create Audience"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Attribution Analysis
              </CardTitle>
              <CardDescription>
                How different touchpoints contribute to conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attributionLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {attribution?.attribution && Object.entries(attribution.attribution).map(([model, value]) => (
                    <div key={model} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-medium capitalize">{model.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(value as number) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-sm w-12 text-right">
                          {formatPercentage(value as number)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Conversion Optimization
              </CardTitle>
              <CardDescription>
                AI-powered recommendations to improve conversion performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => optimizeMutation.mutate()}
                disabled={optimizeMutation.isPending}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                {optimizeMutation.isPending ? "Analyzing..." : "Analyze & Optimize"}
              </Button>

              {optimizeMutation.data && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Optimization Complete</span>
                    </div>
                    <p className="text-green-700">
                      Expected improvement: {optimizeMutation.data.optimization.expectedImprovement}%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recommendations:</h4>
                    {optimizeMutation.data.optimization.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded">
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}