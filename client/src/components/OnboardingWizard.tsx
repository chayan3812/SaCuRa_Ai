import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Facebook, Target, Zap, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface OnboardingData {
  pageId: string;
  goal: string;
  autopilot: boolean;
  budget: number;
  targetAudience: string;
}

const CAMPAIGN_GOALS = [
  { value: 'engagement', label: 'Increase Engagement', icon: '👥', description: 'Boost likes, comments, and shares' },
  { value: 'traffic', label: 'Drive Website Traffic', icon: '🌐', description: 'Get more visitors to your website' },
  { value: 'leads', label: 'Generate Leads', icon: '📧', description: 'Collect contact information' },
  { value: 'sales', label: 'Increase Sales', icon: '💰', description: 'Drive direct purchases' },
  { value: 'awareness', label: 'Brand Awareness', icon: '🎯', description: 'Reach more potential customers' },
  { value: 'app_installs', label: 'App Installs', icon: '📱', description: 'Get more app downloads' }
];

export const OnboardingWizard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    pageId: '',
    goal: '',
    autopilot: false,
    budget: 50,
    targetAudience: ''
  });

  // Check onboarding status
  const { data: onboardingStatus } = useQuery({
    queryKey: ['/api/onboarding/status'],
    retry: false
  });

  // Fetch Facebook pages
  const { data: facebookPages, isLoading: pagesLoading } = useQuery({
    queryKey: ['/api/facebook/pages'],
    retry: false
  });

  // Save onboarding configuration
  const saveOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData & { setupComplete: boolean }) => {
      return await apiRequest('/api/onboarding/save', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Setup Complete!",
        description: "Your AI automation is now active and ready to optimize your campaigns.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/status'] });
      setTimeout(() => setLocation('/'), 1500);
    },
    onError: (error) => {
      toast({
        title: "Setup Failed",
        description: "There was an issue saving your configuration. Please try again.",
        variant: "destructive",
      });
      console.error('Onboarding save error:', error);
    }
  });

  // Initialize automation
  const initializeAutomationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/automation/initialize', 'POST', {
        pageId: formData.pageId,
        enableAutoPosting: formData.autopilot,
        enableAutoBoosting: formData.autopilot
      });
    },
    onSuccess: () => {
      // Proceed to save final configuration
      saveOnboardingMutation.mutate({
        ...formData,
        setupComplete: true
      });
    },
    onError: (error) => {
      toast({
        title: "Automation Setup Failed",
        description: "Failed to initialize automation systems. Please try again.",
        variant: "destructive",
      });
      console.error('Automation initialization error:', error);
      setIsSubmitting(false);
    }
  });

  // If already completed, redirect to dashboard
  useEffect(() => {
    if (onboardingStatus?.setupComplete) {
      toast({
        title: "Already Configured",
        description: "Your automation is already set up. Redirecting to dashboard...",
      });
      setTimeout(() => setLocation('/'), 1500);
    }
  }, [onboardingStatus, setLocation, toast]);

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.pageId || !formData.goal) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize automation systems first
      await initializeAutomationMutation.mutateAsync();
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.pageId !== '';
      case 2:
        return formData.goal !== '';
      case 3:
        return formData.targetAudience.trim().length > 0;
      case 4:
        return formData.budget > 0;
      default:
        return false;
    }
  };

  const getStepProgress = () => (currentStep / 4) * 100;

  if (onboardingStatus?.setupComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Already Configured</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Your automation is already set up and running.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SaCuRa AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Let's set up your AI-powered marketing automation in 4 simple steps
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep} of 4
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.round(getStepProgress())}% Complete
            </span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div>
                <div className="flex items-center mb-6">
                  <Facebook className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <CardTitle className="text-2xl">Connect Your Facebook Page</CardTitle>
                    <CardDescription className="text-lg">
                      Select the Facebook page you want to manage with AI
                    </CardDescription>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="pageId" className="text-base font-medium">
                    Facebook Page *
                  </Label>
                  {pagesLoading ? (
                    <div className="p-4 border rounded-lg">
                      <p className="text-gray-500">Loading your Facebook pages...</p>
                    </div>
                  ) : !facebookPages || facebookPages.length === 0 ? (
                    <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                        No Facebook pages found
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Please connect your Facebook account first in the Facebook Setup page.
                      </p>
                      <Button 
                        onClick={() => setLocation('/facebook-setup')} 
                        className="mt-3"
                        variant="outline"
                      >
                        Go to Facebook Setup
                      </Button>
                    </div>
                  ) : (
                    <Select value={formData.pageId} onValueChange={(value) => handleInputChange('pageId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your Facebook page" />
                      </SelectTrigger>
                      <SelectContent>
                        {facebookPages.map((page: any) => (
                          <SelectItem key={page.id} value={page.id}>
                            <div className="flex items-center">
                              <span className="font-medium">{page.name}</span>
                              {page.category && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {page.category}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <CardTitle className="text-2xl">Choose Your Campaign Goal</CardTitle>
                    <CardDescription className="text-lg">
                      What's your primary marketing objective?
                    </CardDescription>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CAMPAIGN_GOALS.map((goal) => (
                    <Card 
                      key={goal.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.goal === goal.value 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => handleInputChange('goal', goal.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{goal.label}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {goal.description}
                            </p>
                          </div>
                          {formData.goal === goal.value && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="flex items-center mb-6">
                  <Users className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <CardTitle className="text-2xl">Define Your Target Audience</CardTitle>
                    <CardDescription className="text-lg">
                      Describe your ideal customers for better AI targeting
                    </CardDescription>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="targetAudience" className="text-base font-medium">
                      Target Audience Description *
                    </Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="e.g., Small business owners aged 25-45 interested in digital marketing tools, entrepreneurs looking to grow their online presence..."
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Be specific about demographics, interests, and behaviors for better AI optimization
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      💡 Pro Tips for Better Targeting:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Include age ranges and demographics</li>
                      <li>• Mention specific interests or industries</li>
                      <li>• Describe their pain points or goals</li>
                      <li>• Add behavioral characteristics</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <div className="flex items-center mb-6">
                  <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <CardTitle className="text-2xl">Set Your Budget & Automation</CardTitle>
                    <CardDescription className="text-lg">
                      Configure your daily budget and AI automation preferences
                    </CardDescription>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="budget" className="text-base font-medium">
                      Daily Budget (USD) *
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="budget"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                        className="text-lg"
                        placeholder="50"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: $20-$100 per day for optimal results
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                          <Label htmlFor="autopilot" className="text-base font-medium">
                            Enable AI Autopilot
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Let AI automatically create, post, and optimize your content
                        </p>
                      </div>
                      <Switch
                        id="autopilot"
                        checked={formData.autopilot}
                        onCheckedChange={(checked) => handleInputChange('autopilot', checked)}
                      />
                    </div>

                    {formData.autopilot && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          AI Autopilot Features:
                        </h4>
                        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                          <li>• ✨ Automatic content generation based on your goals</li>
                          <li>• 📅 Smart scheduling for optimal engagement times</li>
                          <li>• 🚀 Intelligent boost scheduling for high-performing posts</li>
                          <li>• 📊 Continuous performance optimization</li>
                          <li>• 🎯 Real-time audience targeting adjustments</li>
                        </ul>
                      </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> You can modify these settings anytime from your dashboard. 
                        AI will continuously learn and improve based on your page's performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step === currentStep
                    ? 'bg-blue-600'
                    : step < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="px-8"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Setting up automation...
                </div>
              ) : (
                'Launch AI Automation'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};