import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Facebook, Plus, ExternalLink, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FacebookPage } from "@/types";
import { useState } from "react";

export default function ConnectedAccounts() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: pages = [], isLoading, error } = useQuery<FacebookPage[]>({
    queryKey: ['/api/facebook/pages'],
    retry: false,
  });

  const formatFollowerCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleConnectPage = async () => {
    try {
      setIsConnecting(true);
      // First check if Facebook credentials are properly configured
      const response = await fetch('/api/facebook/verify-credentials');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify Facebook configuration');
      }
      
      // If credentials are valid, proceed with authentication
      window.location.href = '/api/facebook/auth';
    } catch (error) {
      console.error('Facebook connection error:', error);
      setIsConnecting(false);
      // Show error to user
      alert('Facebook connection failed. Please check your Facebook app configuration.');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Facebook className="text-blue-600 w-4 h-4" />
            </div>
            <span>Facebook Pages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-3 h-3 bg-muted-foreground/20 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Facebook className="text-blue-600 w-4 h-4" />
          </div>
          <span>Facebook Pages</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Unable to load Facebook pages. Please check your Facebook app configuration and ensure valid access tokens are provided.
              </AlertDescription>
            </Alert>
          )}
          
          {pages.length === 0 && !error ? (
            <div className="text-center py-8 text-muted-foreground">
              <Facebook className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No Facebook pages connected</p>
              <p className="text-sm mb-4">Connect your Facebook business pages to get started</p>
            </div>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{page.pageName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFollowerCount(page.followerCount)} followers
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))
          )}
          
          <Button 
            onClick={handleConnectPage}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Connect New Page
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
