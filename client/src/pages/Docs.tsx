import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Code, Zap, Database, Users, ArrowRight, ExternalLink, Copy, Play } from "lucide-react";
import sacuraLogo from "@assets/SaCuRa_Ai_Logo_1750010758811.png";

export default function Docs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={sacuraLogo} alt="SaCuRa AI" className="h-12 w-12 rounded-xl shadow-md" />
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SaCuRa AI</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI Marketing Automation</div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">Home</a>
              <a href="/#features" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">Features</a>
              <a href="/#pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">Pricing</a>
              <a href="/about" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">About</a>
              <Button variant="outline" onClick={() => window.location.href = '/api/login'} className="border-blue-200 hover:border-blue-300">
                Sign In
              </Button>
              <Button onClick={() => window.location.href = '/api/login'} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Developer <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete guides, API references, and code examples to help you integrate and build with SaCuRa AI's 
              powerful marketing automation platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Search documentation, API endpoints, guides..."
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Start Guide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get up and running with SaCuRa AI in just a few steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  1
                </div>
                <CardTitle className="text-xl font-bold">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Set up your API credentials and authenticate your application with SaCuRa AI.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                  <code>
                    curl -X POST /api/auth<br />
                    -H "Content-Type: application/json"<br />
                    -d '{"{"}api_key": "your_key"{"}"}'
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  2
                </div>
                <CardTitle className="text-xl font-bold">Connect Facebook</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Link your Facebook pages and business accounts to start automating your marketing.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                  <code>
                    POST /api/facebook/connect<br />
                    {"{{"}<br />
                    &nbsp;&nbsp;"page_id": "123456789",<br />
                    &nbsp;&nbsp;"access_token": "token"<br />
                    {"}}"}
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  3
                </div>
                <CardTitle className="text-xl font-bold">Create Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Launch your first AI-powered marketing campaign with automated content generation.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                  <code>
                    POST /api/campaigns<br />
                    {"{{"}<br />
                    &nbsp;&nbsp;"name": "My Campaign",<br />
                    &nbsp;&nbsp;"ai_enabled": true<br />
                    {"}}"}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Documentation Sections */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              API Reference
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive documentation for all SaCuRa AI API endpoints.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <Code className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">Authentication API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Secure authentication endpoints for API access and user management.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• POST /api/auth/login</li>
                  <li>• POST /api/auth/refresh</li>
                  <li>• DELETE /api/auth/logout</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <Zap className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl">Campaigns API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Create, manage, and optimize your marketing campaigns with AI.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• GET /api/campaigns</li>
                  <li>• POST /api/campaigns</li>
                  <li>• PUT /api/campaigns/{"{id}"}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <Database className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl">Analytics API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Access detailed performance metrics and insights for your campaigns.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• GET /api/analytics/performance</li>
                  <li>• GET /api/analytics/insights</li>
                  <li>• GET /api/analytics/trends</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle className="text-xl">Facebook API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Integrate with Facebook pages, posts, and advertising features.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• GET /api/facebook/pages</li>
                  <li>• POST /api/facebook/posts</li>
                  <li>• GET /api/facebook/insights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle className="text-xl">AI Content API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Generate AI-powered content, captions, and marketing copy.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• POST /api/ai/generate</li>
                  <li>• POST /api/ai/optimize</li>
                  <li>• GET /api/ai/suggestions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardHeader>
                <Play className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle className="text-xl">Webhooks API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Set up real-time notifications and event-driven automation.
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• POST /api/webhooks</li>
                  <li>• GET /api/webhooks</li>
                  <li>• DELETE /api/webhooks/{"{id}"}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Code Examples
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready-to-use code snippets in popular programming languages.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">JavaScript / Node.js</CardTitle>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`// Initialize SaCuRa AI client
const SaCuRaAI = require('@sacura/ai-sdk');

const client = new SaCuRaAI({
  apiKey: process.env.SACURA_API_KEY,
  baseURL: 'https://api.sacura-ai.com'
});

// Generate AI content
async function generatePost() {
  try {
    const response = await client.content.generate({
      topic: 'summer sale promotion',
      tone: 'exciting',
      platform: 'facebook'
    });
    
    console.log('Generated content:', response.text);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

generatePost();`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Python</CardTitle>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`# Initialize SaCuRa AI client
import sacura_ai
from sacura_ai import SaCuRaClient

client = SaCuRaClient(
    api_key=os.getenv('SACURA_API_KEY'),
    base_url='https://api.sacura-ai.com'
)

# Create a new campaign
def create_campaign():
    try:
        campaign = client.campaigns.create({
            'name': 'Summer Sale 2025',
            'target_audience': 'young_adults',
            'budget': 1000,
            'ai_optimization': True
        })
        
        print(f'Campaign created: {campaign.id}')
        return campaign
    except Exception as e:
        print(f'Error: {e}')

create_campaign()`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SDK Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Official SDKs
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Use our official SDKs to integrate SaCuRa AI into your applications quickly and securely.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="border-0 bg-white/10 backdrop-blur-md text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">JavaScript</h3>
                <p className="text-sm text-blue-100">npm install @sacura/ai-sdk</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/10 backdrop-blur-md text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Python</h3>
                <p className="text-sm text-blue-100">pip install sacura-ai</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/10 backdrop-blur-md text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">PHP</h3>
                <p className="text-sm text-blue-100">composer require sacura/ai</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/10 backdrop-blur-md text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold mb-2">Ruby</h3>
                <p className="text-sm text-blue-100">gem install sacura_ai</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl px-8 py-4 text-lg"
            >
              Get API Key <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              View on GitHub <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={sacuraLogo} alt="SaCuRa AI" className="h-10 w-10 rounded-lg" />
                <span className="text-2xl font-bold">SaCuRa AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                The most advanced AI-powered Facebook marketing automation platform.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SaCuRa AI. All rights reserved. Revolutionizing Facebook marketing with AI automation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}