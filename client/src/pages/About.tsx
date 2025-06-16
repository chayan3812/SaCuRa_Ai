import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Rocket, Heart, Globe, ArrowRight } from "lucide-react";
import sacuraLogo from "@assets/SaCuRa_Ai_Logo_1750010758811.png";

export default function About() {
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
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Revolutionizing <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Facebook Marketing
              </span><br />
              with AI Innovation
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Founded in 2024, SaCuRa AI emerged from a simple vision: make advanced AI marketing automation 
              accessible to businesses of all sizes. Today, we're transforming how companies engage with their 
              customers on Facebook.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                To democratize AI-powered marketing automation, enabling businesses worldwide to create 
                meaningful connections with their audiences while scaling efficiently and intelligently.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                We believe that every business deserves access to enterprise-level AI capabilities, 
                regardless of size or technical expertise.
              </p>
            </div>
            
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-8">
                <Target className="h-16 w-16 text-blue-600 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To become the world's most trusted AI marketing platform, where innovation meets 
                  simplicity, and where every interaction drives meaningful business growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do at SaCuRa AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardHeader className="text-center">
                <Rocket className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">Innovation First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  We constantly push the boundaries of what's possible with AI and automation, 
                  delivering cutting-edge solutions that stay ahead of the curve.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardHeader className="text-center">
                <Users className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">Customer Success</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Your success is our success. We're committed to providing exceptional support 
                  and ensuring every customer achieves their marketing goals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardHeader className="text-center">
                <Globe className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-bold">Global Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  We're building technology that creates positive impact worldwide, helping 
                  businesses connect with their communities more effectively.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Passionate innovators dedicated to transforming digital marketing with AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  AI
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Engineering Team</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our brilliant AI researchers and engineers who make the magic happen behind the scenes.
                </p>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Machine Learning Experts
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  CS
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Customer Success</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Dedicated support specialists ensuring every customer achieves their marketing goals.
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  24/7 Support
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  PD
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product Development</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Visionary product managers and developers crafting the future of marketing automation.
                </p>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Innovation Leaders
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join Our Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Become part of the AI marketing revolution and transform how you connect with your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl px-8 py-4 text-lg"
            >
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Contact Our Team
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