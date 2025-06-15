import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Rocket, BarChart3, Settings, Zap } from "lucide-react";
import { BoostPostPanel } from "@/components/BoostPostPanel";
import { AutoPostConfig } from "@/components/AutoPostConfig";

const FacebookAdsAdmin: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facebook Marketing Center</h1>
          <p className="text-muted-foreground">
            Complete automation and advertising management for your Facebook presence
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Phase 3 Active
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Rocket className="h-3 w-3" />
            Phase 4.1 Ready
          </Badge>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="auto-posting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="auto-posting" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Auto-Posting
          </TabsTrigger>
          <TabsTrigger value="boost-posts" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Boost Posts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Campaign Analytics
          </TabsTrigger>
        </TabsList>

        {/* Auto-Posting Tab */}
        <TabsContent value="auto-posting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                AI Auto-Post Engine
              </CardTitle>
              <CardDescription>
                Configure automated content generation and posting based on performance thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoPostConfig />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boost Posts Tab */}
        <TabsContent value="boost-posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                Post Boosting & Advertising
              </CardTitle>
              <CardDescription>
                Create Facebook ad campaigns to boost your existing posts with targeted reach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BoostPostPanel />
            </CardContent>
          </Card>
          
          {/* Campaign Management Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Management</CardTitle>
                <CardDescription>
                  Quick actions for managing your advertising campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Available Actions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• View campaign performance metrics</li>
                    <li>• Activate/pause campaigns</li>
                    <li>• Monitor budget and spend</li>
                    <li>• Track engagement metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration Status</CardTitle>
                <CardDescription>
                  Current setup status for Facebook advertising
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Facebook Access Token</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ad Account ID</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Page ID</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure these in your environment variables to enable advertising features.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Auto-Post Performance
                </CardTitle>
                <CardDescription>
                  Track AI-generated content performance and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Posts Generated</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Avg Performance Score</span>
                      <span className="text-lg font-bold">--</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Engagement</span>
                      <span className="text-lg font-bold">--</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enable auto-posting to start tracking performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-blue-600" />
                  Campaign Performance
                </CardTitle>
                <CardDescription>
                  Monitor advertising campaign results and ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Active Campaigns</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Total Spend</span>
                      <span className="text-lg font-bold">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Reach</span>
                      <span className="text-lg font-bold">--</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create campaigns to start tracking advertising performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Integration Status</CardTitle>
              <CardDescription>
                Overview of your marketing automation capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <h4 className="font-medium">Auto-Posting</h4>
                  <p className="text-sm text-muted-foreground">AI content generation</p>
                  <Badge variant="secondary" className="mt-2">Phase 3</Badge>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Rocket className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">Post Boosting</h4>
                  <p className="text-sm text-muted-foreground">Advertising campaigns</p>
                  <Badge variant="secondary" className="mt-2">Phase 4.1</Badge>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Analytics</h4>
                  <p className="text-sm text-muted-foreground">Performance tracking</p>
                  <Badge variant="secondary" className="mt-2">Integrated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacebookAdsAdmin;