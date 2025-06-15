import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Key,
  Shield,
  Settings,
  Zap,
  RefreshCw
} from "lucide-react";

export default function FacebookSetup() {
  const { toast } = useToast();
  const [testToken, setTestToken] = useState("");
  const [appCredentials, setAppCredentials] = useState({
    appId: "",
    appSecret: "",
    accessToken: ""
  });

  // Query to verify current credentials
  const { data: credentialsStatus, isLoading: verifyLoading, refetch: refetchCredentials } = useQuery({
    queryKey: ['/api/facebook/verify-credentials'],
    retry: false
  });

  // Query to get auth URL
  const { data: authUrlData } = useQuery({
    queryKey: ['/api/facebook/auth-url'],
    retry: false
  });

  // Mutation to validate individual tokens
  const validateTokenMutation = useMutation({
    mutationFn: (tokenData: { token: string }) => apiRequest('/api/facebook/validate-token', {
      method: 'POST',
      body: JSON.stringify(tokenData)
    }),
    onSuccess: (data) => {
      toast({
        title: "Token Validation",
        description: data.validation.isValid ? "Token is valid!" : "Token is invalid",
        variant: data.validation.isValid ? "default" : "destructive"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate token",
        variant: "destructive"
      });
    }
  });

  // Query to get user pages
  const { data: userPages, refetch: refetchPages } = useQuery({
    queryKey: ['/api/facebook/user-pages'],
    retry: false,
    enabled: false
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard"
    });
  };

  const getStatusIcon = (isValid: boolean | undefined) => {
    if (isValid === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return isValid ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isValid: boolean | undefined) => {
    if (isValid === undefined) return <Badge variant="secondary">Unknown</Badge>;
    return isValid ? <Badge variant="default" className="bg-green-500">Valid</Badge> : <Badge variant="destructive">Invalid</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facebook Integration Setup</h1>
          <p className="text-muted-foreground">Configure your Facebook credentials for PagePilot AI</p>
        </div>
        <Button onClick={() => refetchCredentials()} disabled={verifyLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${verifyLoading ? 'animate-spin' : ''}`} />
          Verify Credentials
        </Button>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup Guide
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Test Tokens
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Pages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Credentials Status
              </CardTitle>
              <CardDescription>
                Current status of your Facebook API credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verifyLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : credentialsStatus && typeof credentialsStatus === 'object' && 'results' in credentialsStatus ? (
                <div className="space-y-4">
                  {/* User Token Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon((credentialsStatus as any)?.results?.userToken?.isValid || false)}
                        <span className="font-medium">User Access Token</span>
                        {getStatusBadge((credentialsStatus as any)?.results?.userToken?.isValid || false)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Type: {(credentialsStatus as any)?.results?.userToken?.tokenType || 'Unknown'}
                        {(credentialsStatus as any)?.results?.userToken?.permissions?.length > 0 && 
                          ` • ${(credentialsStatus as any).results.userToken.permissions.length} permissions`
                        }
                      </p>
                      {(credentialsStatus as any)?.results?.userToken?.errorMessage && (
                        <p className="text-sm text-red-600">{(credentialsStatus as any).results.userToken.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  {/* App Token Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon((credentialsStatus as any)?.results?.appToken?.isValid || false)}
                        <span className="font-medium">App Access Token</span>
                        {getStatusBadge((credentialsStatus as any)?.results?.appToken?.isValid || false)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Type: {(credentialsStatus as any)?.results?.appToken?.tokenType || 'Unknown'}
                      </p>
                      {(credentialsStatus as any)?.results?.appToken?.errorMessage && (
                        <p className="text-sm text-red-600">{(credentialsStatus as any).results.appToken.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {(credentialsStatus as any)?.results?.recommendations?.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <strong>Recommendations:</strong>
                          <ul className="list-disc list-inside space-y-1">
                            {(credentialsStatus as any).results.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to verify credentials. Please check your setup.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Facebook Developer App</CardTitle>
                <CardDescription>Create and configure your Facebook app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Facebook Developers <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Create a new app or select existing app</li>
                  <li>Add "Facebook Login" and "Instagram Basic Display" products</li>
                  <li>In Facebook Login settings, add valid OAuth redirect URIs</li>
                  <li>Copy your App ID and App Secret</li>
                </ol>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Required OAuth Redirect URI:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background px-2 py-1 rounded">
                      {window.location.origin}/api/facebook/callback
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(`${window.location.origin}/api/facebook/callback`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Permissions Required</CardTitle>
                <CardDescription>Request these permissions when generating user tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "pages_show_list", desc: "Access to user's pages" },
                    { name: "pages_read_engagement", desc: "Read page engagement data" },
                    { name: "pages_manage_posts", desc: "Create and manage posts" },
                    { name: "ads_read", desc: "Read advertising data" },
                    { name: "business_management", desc: "Access business accounts" },
                    { name: "read_insights", desc: "Access page insights" }
                  ].map((perm) => (
                    <div key={perm.name} className="p-3 border rounded">
                      <code className="text-sm font-mono">{perm.name}</code>
                      <p className="text-xs text-muted-foreground mt-1">{perm.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Generate Access Token</CardTitle>
                <CardDescription>Get a user access token with required permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(authUrlData as any)?.authUrl && (
                  <div className="space-y-3">
                    <p className="text-sm">Click the button below to authenticate with Facebook:</p>
                    <Button asChild>
                      <a href={(authUrlData as any).authUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Authenticate with Facebook
                      </a>
                    </Button>
                  </div>
                )}
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Alternative Method:</strong> Use Facebook's Graph API Explorer to generate tokens manually:
                    <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1">
                      Graph API Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Testing</CardTitle>
              <CardDescription>Test individual tokens to verify their validity and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-token">Access Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-token"
                    placeholder="Enter Facebook access token to test..."
                    value={testToken}
                    onChange={(e) => setTestToken(e.target.value)}
                    type="password"
                  />
                  <Button 
                    onClick={() => validateTokenMutation.mutate(testToken)}
                    disabled={!testToken || validateTokenMutation.isPending}
                  >
                    {validateTokenMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Test Token"
                    )}
                  </Button>
                </div>
              </div>

              {validateTokenMutation.data && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Validation Result:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(validateTokenMutation.data.validation.isValid)}
                      <span>Status: {validateTokenMutation.data.validation.isValid ? 'Valid' : 'Invalid'}</span>
                    </div>
                    <div>Type: {validateTokenMutation.data.validation.tokenType}</div>
                    {validateTokenMutation.data.validation.permissions?.length > 0 && (
                      <div>
                        <span>Permissions ({validateTokenMutation.data.validation.permissions.length}):</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {validateTokenMutation.data.validation.permissions.map((perm: string) => (
                            <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {validateTokenMutation.data.validation.errorMessage && (
                      <div className="text-red-600">Error: {validateTokenMutation.data.validation.errorMessage}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Facebook Pages</CardTitle>
                  <CardDescription>View and manage your Facebook pages</CardDescription>
                </div>
                <Button onClick={() => refetchPages()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Pages
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(userPages as any)?.pages?.length > 0 ? (
                <div className="grid gap-4">
                  {(userPages as any).pages.map((page: any) => (
                    <div key={page.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{page.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {page.id}</p>
                          <p className="text-sm text-muted-foreground">Category: {page.category}</p>
                        </div>
                        <div className="space-y-1">
                          {page.tasks?.map((task: string) => (
                            <Badge key={task} variant="outline" className="text-xs">{task}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pages found. Make sure your access token has the required permissions.</p>
                  <Button className="mt-4" onClick={() => refetchPages()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}