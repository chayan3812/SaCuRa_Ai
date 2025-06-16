import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";
import sacuraLogo from "@assets/SaCuRa_Ai_Logo_1750010758811.png";

export default function Terms() {
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
              <FileText className="w-4 h-4 mr-2" />
              Legal Information
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Terms of <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Please read these Terms of Service carefully before using SaCuRa AI. 
              By accessing or using our service, you agree to be bound by these terms.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: June 16, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  By accessing and using SaCuRa AI ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service may be updated from time to time without notice. Your continued use of the Service 
                  constitutes acceptance of those changes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">2. Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  SaCuRa AI provides AI-powered Facebook marketing automation services, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Automated content creation and posting</li>
                  <li>Campaign optimization and management</li>
                  <li>Customer service automation</li>
                  <li>Performance analytics and insights</li>
                  <li>AI-driven marketing recommendations</li>
                </ul>
                <p>
                  The Service is provided "as is" and SaCuRa AI reserves the right to modify, suspend, or discontinue 
                  any aspect of the Service at any time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">3. User Accounts and Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>
                  You are responsible for all activities that occur under your account and password.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">4. Acceptable Use Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, or discriminatory</li>
                  <li>Violate any applicable local, state, national, or international law or regulation</li>
                  <li>Transmit spam, chain letters, or other unsolicited communications</li>
                  <li>Attempt to gain unauthorized access to our systems or networks</li>
                  <li>Use the Service for any competitive analysis or benchmarking purposes</li>
                  <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">5. Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  Paid subscriptions are billed in advance on a monthly or annual basis. By subscribing, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pay all fees associated with your subscription plan</li>
                  <li>Provide accurate billing information</li>
                  <li>Promptly update your payment information if it changes</li>
                </ul>
                <p>
                  Fees are non-refundable except as required by law. You may cancel your subscription at any time, 
                  but no partial refunds will be provided for unused portions of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">6. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your 
                  information when you use our Service. By using the Service, you consent to the collection and use 
                  of information in accordance with our Privacy Policy.
                </p>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized 
                  access, alteration, disclosure, or destruction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">7. Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive 
                  property of SaCuRa AI and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
                <p>
                  You retain ownership of any content you create using the Service, but you grant us a license to use, 
                  modify, and display such content as necessary to provide the Service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">8. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  In no event shall SaCuRa AI, its directors, employees, partners, agents, suppliers, or affiliates be 
                  liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                  limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
                <p>
                  Our total liability to you for all claims arising out of or relating to the Service shall not exceed 
                  the amount you paid us for the Service in the twelve months preceding the claim.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">9. Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice 
                  or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will cease immediately. If you wish to terminate your 
                  account, you may simply discontinue using the Service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">10. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  These Terms shall be interpreted and governed by the laws of the State of California, United States, 
                  without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction 
                  of the courts located in San Francisco, California.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">11. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@sacura-ai.com</p>
                  <p><strong>Address:</strong> SaCuRa AI Legal Department</p>
                  <p>San Francisco, CA, United States</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            By using SaCuRa AI, you agree to these terms and can start transforming your Facebook marketing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl px-8 py-4 text-lg"
            >
              Accept Terms & Start Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/contact'}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              Questions? Contact Us
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