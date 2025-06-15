import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Plus, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FacebookPage } from "@/types";

export default function ConnectedAccounts() {
  const { data: pages = [], isLoading } = useQuery<FacebookPage[]>({
    queryKey: ['/api/facebook/pages'],
  });

  const formatFollowerCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleConnectPage = () => {
    window.location.href = '/api/facebook/auth';
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
          {pages.length === 0 ? (
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect New Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
