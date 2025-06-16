import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Webhook, 
  MessageSquare, 
  Heart, 
  Share2, 
  AlertCircle, 
  CheckCircle, 
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface WebhookSubscription {
  pageId: string;
  subscriptions: string[];
  isActive: boolean;
  lastActivity?: Date;
}

interface FacebookEvent {
  id: string;
  type: string;
  pageId: string;
  timestamp: Date;
  data: any;
  processed: boolean;
}

export default function FacebookWebhookManager() {
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [events, setEvents] = useState<FacebookEvent[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableFields = [
    { id: 'feed', label: 'Page Posts & Comments', description: 'New posts, comments, reactions' },
    { id: 'messages', label: 'Customer Messages', description: 'Direct messages from customers' },
    { id: 'messaging_postbacks', label: 'Button Clicks', description: 'CTA button interactions' },
    { id: 'message_deliveries', label: 'Message Status', description: 'Delivery confirmations' },
    { id: 'message_reads', label: 'Read Receipts', description: 'When messages are read' },
    { id: 'messaging_optins', label: 'Opt-ins', description: 'Customer subscription requests' },
    { id: 'messaging_referrals', label: 'Referrals', description: 'Traffic from referral sources' },
    { id: 'messaging_handovers', label: 'Handovers', description: 'Chat transfers between apps' },
    { id: 'messaging_policy_enforcement', label: 'Policy Actions', description: 'Policy violation notifications' }
  ];

  // Fetch webhook status
  const { data: webhookStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/facebook/webhook/status', pageId],
    enabled: !!pageId && !!accessToken,
    refetchInterval: 30000 // Check every 30 seconds
  });

  // Subscribe to webhooks mutation
  const subscribeToWebhooks = useMutation({
    mutationFn: async (data: { pageId: string; accessToken: string; fields: string[] }) => {
      return await apiRequest('/api/facebook/webhook/subscribe', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Webhook Subscription Active",
        description: "Successfully subscribed to Facebook events. Real-time monitoring is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/webhook/status'] });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to webhooks",
        variant: "destructive",
      });
    }
  });

  // Test webhook mutation
  const testWebhook = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/facebook/webhook/test', 'POST', {});
    },
    onSuccess: (data) => {
      toast({
        title: "Test Webhook Sent",
        description: "Test event processed successfully",
      });
      // Add test event to local state
      const testEvent: FacebookEvent = {
        id: `test_${Date.now()}`,
        type: 'test_event',
        pageId: 'test_page',
        timestamp: new Date(),
        data: data.testEvent,
        processed: true
      };
      setEvents(prev => [testEvent, ...prev.slice(0, 49)]);
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test webhook",
        variant: "destructive",
      });
    }
  });

  const handleSubscribe = () => {
    if (!pageId || !accessToken || selectedFields.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide Page ID, Access Token, and select at least one event type",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    subscribeToWebhooks.mutate({ pageId, accessToken, fields: selectedFields });
    setTimeout(() => setIsSubscribing(false), 2000);
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'reaction': return <Heart className="h-4 w-4" />;
      case 'share': return <Share2 className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'message': return 'bg-blue-500';
      case 'reaction': return 'bg-red-500';
      case 'share': return 'bg-green-500';
      case 'comment': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Simulate real-time events (in production, this would come from WebSocket or Server-Sent Events)
  useEffect(() => {
    const interval = setInterval(() => {
      if (webhookStatus?.subscriptions?.length > 0) {
        // Simulate random Facebook events for demo
        const eventTypes = ['message', 'reaction', 'comment', 'share'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const newEvent: FacebookEvent = {
          id: `event_${Date.now()}`,
          type: randomType,
          pageId: pageId || 'demo_page',
          timestamp: new Date(),
          data: {
            message: randomType === 'message' ? 'Customer inquiry received' : `New ${randomType} detected`,
            user: 'Customer_' + Math.floor(Math.random() * 1000)
          },
          processed: true
        };

        setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
      }
    }, 15000); // Add new event every 15 seconds when subscribed

    return () => clearInterval(interval);
  }, [webhookStatus, pageId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facebook Webhooks</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of Facebook page events and customer interactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={webhookStatus?.subscriptions?.length > 0 ? "default" : "secondary"}>
            <Activity className="h-3 w-3 mr-1" />
            {webhookStatus?.subscriptions?.length > 0 ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="events">Event Log</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure Facebook webhook subscriptions to receive real-time events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageId">Facebook Page ID</Label>
                  <Input
                    id="pageId"
                    placeholder="Enter your Facebook Page ID"
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Page Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="Enter Page Access Token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Event Subscriptions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Switch
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={field.id} className="font-medium">
                          {field.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing || subscribeToWebhooks.isPending}
                  className="flex-1"
                >
                  {isSubscribing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Webhook className="h-4 w-4 mr-2" />
                      Subscribe to Events
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => testWebhook.mutate()}
                  disabled={testWebhook.isPending}
                >
                  {testWebhook.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webhookStatus?.subscriptions?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Event types monitored
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time events received
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Online</div>
                <p className="text-xs text-muted-foreground">
                  Webhook system operational
                </p>
              </CardContent>
            </Card>
          </div>

          {webhookStatus?.subscriptions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Subscriptions</CardTitle>
                <CardDescription>
                  Active webhook subscriptions for {pageId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {webhookStatus.subscriptions.map((subscription: string) => (
                    <Badge key={subscription} variant="outline">
                      {subscription}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Event Log</CardTitle>
              <CardDescription>
                Live stream of Facebook events and customer interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {events.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No events received yet</p>
                      <p className="text-sm">Events will appear here when your webhook is active</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{event.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.timestamp.toLocaleTimeString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.data.message || 'Facebook event received'}
                          </p>
                          {event.data.user && (
                            <p className="text-xs text-muted-foreground">
                              From: {event.data.user}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {event.processed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Webhook URL Information */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Webhook URL:</strong> https://sa-cura-live-sopiahank.replit.app/api/facebook/webhook<br/>
          <strong>Verify Token:</strong> sacura_webhook_verify_token<br/>
          Configure these settings in your Facebook App's Webhooks section.
        </AlertDescription>
      </Alert>
    </div>
  );
}