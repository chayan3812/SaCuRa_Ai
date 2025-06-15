import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Users, Lock, Database, Globe, Mail, Phone } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            SaCuRa AI - PagePilot AI Platform
          </p>
          <Badge variant="outline" className="mb-4">
            Last Updated: June 15, 2025
          </Badge>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              SaCuRa AI ("we," "our," or "us") operates the PagePilot AI platform, an advanced AI-powered 
              Facebook marketing automation and customer service platform. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using our service, you agree to the collection and use of information in accordance with 
              this Privacy Policy. We are committed to protecting your privacy and ensuring the security 
              of your personal information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Personal Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Facebook account information (when you connect your Facebook account)</li>
                <li>Business information and Facebook Page details</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Facebook Data
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Facebook Page information, posts, and engagement metrics</li>
                <li>Customer messages and interactions from your Facebook Pages</li>
                <li>Facebook advertising account data and campaign performance</li>
                <li>Facebook Pixel data and conversion tracking information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Usage Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Platform usage statistics and feature interactions</li>
                <li>AI-generated insights and recommendations</li>
                <li>System performance and error logs</li>
                <li>IP addresses and device information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Provide and maintain our AI-powered marketing automation services</li>
              <li>Process Facebook advertising campaigns and customer service interactions</li>
              <li>Generate AI insights and recommendations for your business</li>
              <li>Improve our platform's performance and user experience</li>
              <li>Send important service updates and notifications</li>
              <li>Provide customer support and technical assistance</li>
              <li>Comply with legal obligations and prevent fraud</li>
              <li>Track conversion data through Facebook Conversions API</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-orange-600" />
              Information Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Facebook Integration
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We share necessary data with Facebook through their official APIs to provide our services, 
                including the Facebook Graph API and Conversions API. This data sharing is essential for 
                managing your Facebook Pages, advertising campaigns, and customer interactions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Third-Party Services
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>AI service providers (OpenAI, Anthropic) for generating insights and responses</li>
                <li>Payment processors for handling subscription and billing</li>
                <li>Cloud hosting providers for secure data storage and processing</li>
                <li>Analytics services to improve platform performance</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Legal Requirements
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We may disclose your information if required by law, court order, or government regulation, 
                or to protect our rights, property, or safety of our users.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-600" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>End-to-end encryption for data transmission and storage</li>
              <li>Secure authentication using Facebook's App Secret Proof system</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and employee training on data protection</li>
              <li>Secure cloud infrastructure with automated backups</li>
              <li>Compliance with GDPR, CCPA, and other privacy regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-teal-600" />
              Your Rights and Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-indigo-600" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We retain your information only as long as necessary to provide our services and comply 
              with legal obligations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Account information: Retained while your account is active</li>
              <li>Facebook data: Retained according to Facebook's data retention policies</li>
              <li>AI training data: Anonymized and retained for service improvement</li>
              <li>Usage logs: Retained for 12 months for security and performance analysis</li>
              <li>Financial records: Retained for 7 years as required by law</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-cyan-600" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Standard Contractual Clauses (SCCs) for data transfers</li>
              <li>Adequacy decisions by relevant data protection authorities</li>
              <li>Binding Corporate Rules where applicable</li>
              <li>Your explicit consent for specific transfers</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-pink-600" />
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Our service is not intended for children under 16 years of age. We do not knowingly 
              collect personal information from children under 16. If you are a parent or guardian 
              and believe your child has provided us with personal information, please contact us 
              immediately.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              Changes to This Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy periodically to reflect changes in our practices or 
              legal requirements. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Posting the updated policy on our platform</li>
              <li>Sending email notifications to registered users</li>
              <li>Displaying prominent notices on our website</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Your continued use of our service after changes become effective constitutes acceptance 
              of the revised Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-green-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  Email: privacy@sacura-ai.com
                </span>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  Website: https://sa-cura-live-sopiahank.replit.app
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  Response Time: Within 48 hours
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            © 2025 SaCuRa AI - PagePilot AI Platform. All rights reserved.
          </p>
          <p>
            This Privacy Policy is compliant with GDPR, CCPA, and Facebook Platform Policies.
          </p>
        </div>
      </div>
    </div>
  );
}