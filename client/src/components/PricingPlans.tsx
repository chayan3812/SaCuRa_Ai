import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";

export const PricingPlans: React.FC = () => {
  const plans = [
    {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: <Star className="h-6 w-6" />,
      features: [
        "Connect 1 Facebook Page",
        "5 auto-posts per month",
        "Basic analytics",
        "Community support"
      ],
      limitations: [
        "No boost automation",
        "Limited AI insights",
        "Basic templates only"
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Advanced automation for growing businesses",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Up to 5 Facebook Pages",
        "Unlimited posts",
        "Boost automation + insights",
        "AI-powered content generation",
        "Advanced analytics dashboard",
        "Email + Slack reports",
        "Priority support",
        "Custom scheduling"
      ],
      limitations: [],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "Complete solution for agencies and large teams",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Unlimited Facebook Pages",
        "Unlimited everything",
        "Advanced AI optimization",
        "White-label dashboard",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 priority support",
        "Custom reporting",
        "API access",
        "Team collaboration tools"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full power of AI-driven Facebook marketing automation
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {plan.icon}
                </div>
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="space-y-1">
                <div className="text-4xl font-bold">{plan.price}</div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              {plan.limitations.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Limitations:</p>
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-center space-x-3">
                      <div className="h-4 w-4 rounded-full bg-muted flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button 
                variant={plan.buttonVariant} 
                className="w-full"
                size="lg"
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center pt-8 space-y-4">
        <h3 className="text-lg font-semibold">All plans include:</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div>✓ Facebook API Integration</div>
          <div>✓ Real-time Analytics</div>
          <div>✓ Content Scheduling</div>
          <div>✓ Performance Tracking</div>
        </div>
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Need a custom solution? <Button variant="link" className="p-0 h-auto text-sm">Contact our sales team</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;