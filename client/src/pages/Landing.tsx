import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  ChartLine, 
  Megaphone, 
  Headphones, 
  Shield, 
  Users, 
  Search, 
  Brain,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Zap,
  Clock,
  DollarSign,
  Target
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: Megaphone,
      title: "Ad Optimizer",
      description: "AI-driven ad optimization with real-time performance monitoring and budget recommendations",
      color: "text-sacura-primary",
      bgColor: "bg-sacura-primary/10"
    },
    {
      icon: Headphones,
      title: "Customer Service Automation",
      description: "24/7 AI customer service with 0.8s average response time and human escalation",
      color: "text-sacura-secondary",
      bgColor: "bg-sacura-secondary/10"
    },
    {
      icon: Shield,
      title: "Restriction Prevention",
      description: "Proactive policy compliance monitoring to prevent account restrictions and bans",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      icon: Users,
      title: "Employee Monitoring",
      description: "Track team performance with response time alerts and productivity insights",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Search,
      title: "Competitor Analysis",
      description: "Monitor competitor strategies and identify market opportunities",
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Advanced analytics with predictive recommendations and growth opportunities",
      color: "text-pink-600",
      bgColor: "bg-pink-100"
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Reduce Ad Spend Waste",
      description: "Save up to 40% on advertising costs with AI-optimized budget allocation",
      stat: "40% Savings"
    },
    {
      icon: Clock,
      title: "Instant Customer Responses",
      description: "AI handles 89% of customer inquiries with sub-second response times",
      stat: "0.8s Response"
    },
    {
      icon: Shield,
      title: "Prevent Account Restrictions",
      description: "94% success rate in preventing policy violations and account bans",
      stat: "94% Prevention"
    },
    {
      icon: TrendingUp,
      title: "Increase Engagement",
      description: "Boost engagement rates by up to 35% with AI-optimized content timing",
      stat: "35% Increase"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp Solutions",
      content: "SaCuRa AI transformed our Facebook marketing. We've seen a 50% increase in lead quality and our team can focus on strategy instead of monitoring.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Small Business Owner",
      company: "Local Restaurant Chain",
      content: "The AI customer service is incredible. It handles most inquiries perfectly, and when it escalates to us, we know it's important. Our response time improved dramatically.",
      rating: 5
    },
    {
      name: "Lisa Park",
      role: "Digital Marketing Manager",
      company: "E-commerce Startup",
      content: "The restriction prevention feature saved our account twice. The AI caught policy issues before they became problems. Worth every penny.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sacura-primary rounded-lg flex items-center justify-center">
                <Bot className="text-white w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">SaCuRa</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">JAm AI</p>
              </div>
            </div>
            <Button onClick={handleLogin} className="bg-sacura-primary hover:bg-sacura-primary/90 text-sm sm:text-base px-3 sm:px-4 py-2">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-sacura-primary/5 via-purple-50 to-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="bg-sacura-primary/10 text-sacura-primary mb-4 sm:mb-6 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              AI-Powered Facebook Marketing Automation
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              The Ultimate AI Agent for 
              <span className="text-sacura-primary"> Facebook Business</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
              Optimize ads, automate customer service, and prevent restrictions with our AI-powered platform. 
              Transform your Facebook marketing with real-time automation that maximizes performance and minimizes risk.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8 sm:mb-12">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="bg-sacura-primary hover:bg-sacura-primary/90 text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-sacura-primary mb-1 sm:mb-2">2.8K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Businesses Trust Us</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-sacura-secondary mb-1 sm:mb-2">89%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">AI Response Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-sacura-accent mb-1 sm:mb-2">94%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Issue Prevention</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1 sm:mb-2">0.8s</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful AI-Driven Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate, optimize, and scale your Facebook business presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`${feature.color} w-6 h-6`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Measurable Business Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See real results with our AI-powered automation platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-sacura-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-sacura-primary w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold text-sacura-primary mb-2">{benefit.stat}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How SaCuRa AI Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple setup, powerful automation, measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sacura-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Connect Your Pages</h3>
              <p className="text-muted-foreground">
                Securely connect your Facebook business pages and ad accounts with one-click OAuth integration
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sacura-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI Learns & Monitors</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your content, audience, and performance patterns while monitoring 24/7 for issues
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sacura-accent rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Automate & Optimize</h3>
              <p className="text-muted-foreground">
                AI handles customer service, optimizes ad performance, and prevents policy violations automatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted by Growing Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about their results with SaCuRa AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-sacura-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-sacura-primary">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]"></div>
        
        <div className="relative container mx-auto px-6 text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-md rounded-full border border-yellow-400/30 text-yellow-300 text-base font-bold mb-8 shadow-lg">
            <Zap className="w-5 h-5 mr-3 text-yellow-400" />
            🔥 LIMITED TIME OFFER
          </div>
          
          {/* Enhanced Main Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
            Ready to Transform Your
            <br className="hidden sm:block" />
            <span className="relative">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Facebook Marketing?
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
            </span>
          </h2>
          
          {/* Enhanced Description */}
          <p className="text-xl sm:text-2xl text-gray-100 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Join <span className="text-yellow-400 font-bold">5,000+</span> businesses using SaCuRa AI to automate Facebook marketing, 
            <br className="hidden sm:block" />
            reduce costs by <span className="text-green-400 font-bold">40%</span>, and drive <span className="text-blue-400 font-bold">3x better results</span> with intelligent automation.
          </p>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl sm:text-5xl font-black text-green-400 mb-2">3x</div>
              <div className="text-lg text-gray-200 font-semibold">Better ROI</div>
              <div className="text-sm text-gray-400 mt-1">Average improvement</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl sm:text-5xl font-black text-blue-400 mb-2">40%</div>
              <div className="text-lg text-gray-200 font-semibold">Cost Reduction</div>
              <div className="text-sm text-gray-400 mt-1">Marketing spend saved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl sm:text-5xl font-black text-purple-400 mb-2">24/7</div>
              <div className="text-lg text-gray-200 font-semibold">AI Support</div>
              <div className="text-sm text-gray-400 mt-1">Always monitoring</div>
            </div>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 hover:scale-110 transition-all duration-300 text-xl px-12 py-6 shadow-2xl font-black group border-0 rounded-full"
            >
              🚀 START FREE TRIAL NOW
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-3 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-md text-xl px-12 py-6 rounded-full font-bold transition-all duration-300"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Play className="w-6 h-6 mr-3" />
              Watch Demo
            </Button>
          </div>
          
          {/* Enhanced Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
              <span className="text-gray-200 font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <Shield className="w-5 h-5 mr-3 text-blue-400" />
              <span className="text-gray-200 font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <Clock className="w-5 h-5 mr-3 text-purple-400" />
              <span className="text-gray-200 font-medium">5-Minute Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-sacura-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SaCuRa</h1>
              <p className="text-sm text-muted-foreground">JAm AI</p>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground">
            <p className="mb-4">© 2024 SaCuRa Solutions. All rights reserved.</p>
            <p className="text-sm">Dream | Transform | Reality</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
