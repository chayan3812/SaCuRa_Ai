/**
 * Facebook Integration Page
 * Comprehensive Facebook management with Core and Advanced features
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FacebookCore from '@/components/facebook/FacebookCore';
import FacebookDashboard from '@/components/facebook/FacebookDashboard';
import FacebookAdsManager from '@/components/facebook/FacebookAdsManager';
import AIContentOptimizer from '@/components/facebook/AIContentOptimizer';
import { Facebook as FacebookIcon, Zap, Bot, BarChart3, Settings } from 'lucide-react';

export default function Facebook() {
  const [activeTab, setActiveTab] = useState('core');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FacebookIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Facebook Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Complete Facebook marketing automation and management platform
              </p>
            </div>
          </div>
          
          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-sm">Core Integration</div>
                    <div className="text-xs text-gray-500">Basic operations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-sm">Advanced Analytics</div>
                    <div className="text-xs text-gray-500">Deep insights</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-sm">Ad Management</div>
                    <div className="text-xs text-gray-500">Campaign optimization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-semibold text-sm">AI Optimizer</div>
                    <div className="text-xs text-gray-500">Automated content</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="core" className="flex items-center space-x-2">
              <Facebook className="h-4 w-4" />
              <span className="hidden sm:inline">Core</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Optimizer</span>
            </TabsTrigger>
            <TabsTrigger value="setup" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Setup</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span>Facebook Core Integration</span>
                  <Badge variant="secondary">Simplified Interface</Badge>
                </CardTitle>
                <CardDescription>
                  Essential Facebook operations with a clean, easy-to-use interface. 
                  Perfect for quick posts, basic insights, and media uploads.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FacebookCore />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span>Advanced Facebook Analytics</span>
                  <Badge variant="default">Enterprise Grade</Badge>
                </CardTitle>
                <CardDescription>
                  Comprehensive analytics dashboard with detailed insights, 
                  performance tracking, and advanced reporting capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FacebookDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Facebook Ads Manager</span>
                  <Badge variant="default">Professional Tools</Badge>
                </CardTitle>
                <CardDescription>
                  Complete ad campaign management with creation, optimization, 
                  and performance tracking for maximum ROI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FacebookAdsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-orange-600" />
                  <span>AI Content Optimizer</span>
                  <Badge variant="default">AI Powered</Badge>
                </CardTitle>
                <CardDescription>
                  Intelligent content generation and optimization with automated 
                  publishing, creative fatigue detection, and performance-driven content creation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIContentOptimizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Facebook Setup & Configuration</span>
                  <Badge variant="outline">Configuration</Badge>
                </CardTitle>
                <CardDescription>
                  Connect your Facebook account, configure API credentials, 
                  and set up webhook integration for live functionality.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Credentials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Required API Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Basic Configuration</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• FACEBOOK_APP_ID</li>
                        <li>• FACEBOOK_APP_SECRET</li>
                        <li>• FACEBOOK_PAGE_ID</li>
                        <li>• FB_PAGE_ACCESS_TOKEN</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Advanced Features</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• AD_ACCOUNT_ID (for ads)</li>
                        <li>• PIXEL_ID (for conversions)</li>
                        <li>• WEBHOOK_VERIFY_TOKEN</li>
                        <li>• MARKETING_ACCESS_TOKEN</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Features Overview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Core Integration</h4>
                      <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                        <li>• Post publishing</li>
                        <li>• Page insights</li>
                        <li>• Media uploads</li>
                        <li>• Post scheduling</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Advanced Analytics</h4>
                      <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                        <li>• Performance tracking</li>
                        <li>• Engagement metrics</li>
                        <li>• Audience insights</li>
                        <li>• ROI analysis</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">AI Automation</h4>
                      <ul className="text-sm text-purple-600 dark:text-purple-300 space-y-1">
                        <li>• Content generation</li>
                        <li>• Creative fatigue detection</li>
                        <li>• Auto-publishing</li>
                        <li>• Performance optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Integration Status */}
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium mb-2">Integration Status</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your SaCuRa AI platform includes both simplified Core integration for basic operations 
                    and advanced enterprise-grade features for professional Facebook marketing automation. 
                    All components are production-ready and require valid Facebook API credentials for live functionality.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}