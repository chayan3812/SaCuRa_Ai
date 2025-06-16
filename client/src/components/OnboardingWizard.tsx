import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Facebook, Target, Bot, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingData {
  pageId: string;
  goal: string;
  autopilot: boolean;
  budget: number;
  targetAudience: string;
}

export const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<OnboardingData>({
    pageId: "",
    goal: "",
    autopilot: true,
    budget: 50,
    targetAudience: ""
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.pageId.trim()) {
          toast({
            title: "Page ID Required",
            description: "Please enter your Facebook Page ID to continue.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.goal) {
          toast({
            title: "Campaign Goal Required",
            description: "Please select your primary campaign goal.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        if (formData.budget < 10) {
          toast({
            title: "Minimum Budget Required",
            description: "Daily budget must be at least $10.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest("/api/onboarding/save", {
        method: "POST",
        body: JSON.stringify({
          pageId: formData.pageId,
          goal: formData.goal,
          autopilot: formData.autopilot,
          budget: formData.budget,
          targetAudience: formData.targetAudience,
          setupComplete: true
        })
      });

      // Initialize automation if autopilot is enabled
      if (formData.autopilot) {
        await apiRequest("/api/automation/initialize", {
          method: "POST",
          body: JSON.stringify({
            pageId: formData.pageId,
            enableAutoPosting: true,
            enableAutoBoosting: true
          })
        });
      }

      setIsComplete(true);
      
      toast({
        title: "Setup Complete!",
        description: "Your Facebook marketing automation is now active.",
        variant: "default"
      });

    } catch (error) {
      console.error("Onboarding failed:", error);
      toast({
        title: "Setup Failed",
        description: "There was an error completing your setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to SaCuRa AI!</h2>
            <p className="text-gray-600 mb-6">
              Your Facebook marketing automation is now live and ready to boost your business.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Bot className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">AI Content</h3>
                <p className="text-sm text-gray-600">Automated content generation</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Smart Targeting</h3>
                <p className="text-sm text-gray-600">Optimal audience reach</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Auto Boosting</h3>
                <p className="text-sm text-gray-600">Performance-based promotion</p>
              </div>
            </div>
            <Button onClick={() => window.location.href = "/dashboard"} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            Facebook Marketing Setup
          </CardTitle>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">Step {step} of {totalSteps}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Connect Your Facebook Page</h3>
                <p className="text-gray-600">Enter your Facebook Page ID to get started</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pageId">Facebook Page ID</Label>
                <Input
                  id="pageId"
                  placeholder="Enter your Facebook Page ID"
                  value={formData.pageId}
                  onChange={(e) => updateFormData('pageId', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  You can find your Page ID in your Facebook Page settings or URL
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNext}>Next Step</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Choose Your Campaign Goal</h3>
                <p className="text-gray-600">What's your primary marketing objective?</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Campaign Goal</Label>
                <Select value={formData.goal} onValueChange={(value) => updateFormData('goal', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                    <SelectItem value="engagement">Engagement & Likes</SelectItem>
                    <SelectItem value="traffic">Website Traffic</SelectItem>
                    <SelectItem value="leads">Lead Generation</SelectItem>
                    <SelectItem value="conversions">Sales & Conversions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Business owners, Tech enthusiasts, Local customers"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
                <Button onClick={handleNext}>Next Step</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Set Your Budget</h3>
                <p className="text-gray-600">Configure your daily advertising budget</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Daily Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.budget}
                  onChange={(e) => updateFormData('budget', parseInt(e.target.value) || 10)}
                />
                <p className="text-xs text-gray-500">
                  Minimum $10/day recommended for effective reach
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Budget Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• $10-25/day: Local businesses, small audience</li>
                  <li>• $25-50/day: Regional reach, medium audience</li>
                  <li>• $50+/day: National reach, large audience</li>
                </ul>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
                <Button onClick={handleNext}>Next Step</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Enable AI Autopilot</h3>
                <p className="text-gray-600">Let AI handle your content and advertising automatically</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autopilot"
                    checked={formData.autopilot}
                    onCheckedChange={(checked) => updateFormData('autopilot', checked)}
                  />
                  <Label htmlFor="autopilot" className="text-base">
                    Enable AI Autopilot (Recommended)
                  </Label>
                </div>

                {formData.autopilot && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">AI Autopilot Features:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Automated content generation and posting</li>
                      <li>• Smart timing based on audience insights</li>
                      <li>• Performance-based budget optimization</li>
                      <li>• Intelligent audience targeting</li>
                      <li>• Real-time campaign adjustments</li>
                    </ul>
                  </div>
                )}

                {!formData.autopilot && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Manual Control:</h4>
                    <p className="text-sm text-gray-700">
                      You'll create and manage content manually through the dashboard.
                      AI insights and recommendations will still be available.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
                <Button 
                  onClick={handleFinish} 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Setting up..." : "Launch Marketing Engine"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};