import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, BookOpen, MessageSquare, Video, Download, ArrowRight, Clock, Users, Zap } from "lucide-react";
import sacuraLogo from "@assets/SaCuRa_Ai_Logo_1750010758811.png";

export default function Help() {
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
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              How Can We <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Help You Today?
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find answers, tutorials, and resources to get the most out of SaCuRa AI's powerful 
              Facebook marketing automation platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Search for help articles, tutorials, or features..."
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

      {/* Quick Access Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Popular Topics
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started quickly with our most popular help topics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardHeader className="text-center">
                <Zap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  Learn the basics of setting up your SaCuRa AI account and connecting your Facebook pages.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Account setup and configuration</li>
                  <li>• Facebook page connection</li>
                  <li>• First campaign creation</li>
                  <li>• Basic automation setup</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardHeader className="text-center">
                <Users className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">AI Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  Discover how to leverage our advanced AI capabilities for maximum marketing impact.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• AI content generation</li>
                  <li>• Smart audience targeting</li>
                  <li>• Automated optimization</li>
                  <li>• Performance analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardHeader className="text-center">
                <Clock className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  Quick solutions to common issues and technical problems you might encounter.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Connection issues</li>
                  <li>• Campaign not running</li>
                  <li>• API rate limits</li>
                  <li>• Billing questions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resource Types */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Learning Resources
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Multiple ways to learn and get support with SaCuRa AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Documentation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Comprehensive guides and API references
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/docs'}>
                  Browse Docs
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Video Tutorials</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Step-by-step video guides and walkthroughs
                </p>
                <Button variant="outline" size="sm">
                  Watch Videos
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Get instant help from our support team
                </p>
                <Button variant="outline" size="sm">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 text-center">
                <Download className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Resources</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Templates, guides, and best practices
                </p>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Quick answers to the most common questions about SaCuRa AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">How do I connect my Facebook page?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Navigate to Settings &gt; Connected Accounts and click "Connect Facebook Page." 
                  You'll be guided through Facebook's authorization process to grant SaCuRa AI 
                  the necessary permissions to manage your page.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">How does the AI content generation work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI analyzes your brand voice, audience engagement patterns, and current trends 
                  to generate personalized content. You can provide topics, tone preferences, and 
                  the AI will create engaging posts optimized for your specific audience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Can I schedule posts in advance?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! Use our Content Scheduler to plan and schedule posts days or weeks in advance. 
                  The AI can also suggest optimal posting times based on when your audience is most active.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">What if my campaigns aren't performing well?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  SaCuRa AI continuously monitors campaign performance and provides automated 
                  optimization suggestions. Check the Analytics dashboard for detailed insights 
                  and recommended improvements to boost your campaign performance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">How do I upgrade my subscription plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Go to Settings &gt; Billing and select "Upgrade Plan." You can switch between plans 
                  at any time, and billing will be prorated. Enterprise customers should contact 
                  our sales team for custom pricing options.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure with SaCuRa AI?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and follow 
                  strict data protection protocols. Your Facebook data and marketing information 
                  are secured with industry-leading security measures.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Our support team is here to help you succeed with SaCuRa AI. Get personalized assistance 
            and expert guidance for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/contact'}
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl px-8 py-4 text-lg"
            >
              Contact Support <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Schedule a Call
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