import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Landing and Auth Pages
import Landing from "@/pages/Landing";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Help from "@/pages/Help";
import Docs from "@/pages/Docs";

// Authenticated Pages
import Dashboard from "@/pages/Dashboard";
import AdOptimizer from "@/pages/AdOptimizer";
import AutoPoster from "@/pages/AutoPoster";
import AutoPostAdmin from "@/pages/AutoPostAdmin";
import FacebookAdsAdmin from "@/pages/FacebookAdsAdmin";
import ContentQueue from "@/pages/ContentQueue";
import Analytics from "@/pages/Analytics";
import PageStatus from "@/pages/PageStatus";
import CustomerService from "@/pages/CustomerService";
import SmartInbox from "@/pages/SmartInbox";
import AIPerformance from "@/pages/AIPerformance";
import FeedbackAnalytics from "@/pages/FeedbackAnalytics";
import AITraining from "@/pages/AITraining";
import AITestDashboard from "@/pages/AITestDashboard";
import AISelfOptimizer from "@/pages/AISelfOptimizer";
import AIVersionManager from "@/pages/AIVersionManager";
import AIModelDashboard from "@/pages/AIModelDashboard";
import WeeklyAIIntelligence from "@/pages/WeeklyAIIntelligence";
import AgentCoPilot from "@/pages/AgentCoPilot";
import SLADashboard from "@/pages/SLADashboard";
import AdminAIReplay from "@/pages/AdminAIReplay";
import AdminAIDigest from "@/pages/AdminAIDigest";
import Facebook from "@/pages/Facebook";
import FacebookAnalytics from "@/pages/FacebookAnalytics";
import FacebookSetup from "@/pages/FacebookSetup";
import FacebookConversions from "@/pages/FacebookConversions";
import FacebookAds from "@/pages/FacebookAds";
import MarketingAPI from "@/pages/MarketingAPI";
import RestrictionMonitor from "@/pages/RestrictionMonitor";
import EmployeeMonitor from "@/pages/EmployeeMonitor";
import CompetitorAnalysis from "@/pages/CompetitorAnalysis";
import AIInsights from "@/pages/AIInsights";
import HybridAI from "@/pages/HybridAI";
import MLIntelligence from "@/pages/MLIntelligence";
import SystemHealth from "@/pages/SystemHealth";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/help" component={Help} />
      <Route path="/docs" component={Docs} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/login" component={() => { window.location.href = '/api/login'; return null; }} />
      {isAuthenticated ? (
        <AppLayout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/ads" component={AdOptimizer} />
            <Route path="/auto-poster" component={AutoPoster} />
            <Route path="/admin/auto-post-config" component={AutoPostAdmin} />
            <Route path="/admin/facebook-ads" component={FacebookAdsAdmin} />
            <Route path="/content-queue" component={ContentQueue} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/page-status" component={PageStatus} />
            <Route path="/customer-service" component={CustomerService} />
            <Route path="/smart-inbox" component={SmartInbox} />
            <Route path="/ai-performance" component={AIPerformance} />
            <Route path="/feedback-analytics" component={FeedbackAnalytics} />
            <Route path="/ai-training" component={AITraining} />
            <Route path="/ai-test" component={AITestDashboard} />
            <Route path="/ai-optimizer" component={AISelfOptimizer} />
            <Route path="/ai-version-manager" component={AIVersionManager} />
            <Route path="/ai-model" component={AIModelDashboard} />
            <Route path="/weekly-ai-intelligence" component={WeeklyAIIntelligence} />
            <Route path="/agent-copilot" component={AgentCoPilot} />
            <Route path="/sla-dashboard" component={SLADashboard} />
            <Route path="/admin/ai-replay" component={AdminAIReplay} />
            <Route path="/admin/ai-digest" component={AdminAIDigest} />
            <Route path="/facebook" component={Facebook} />
            <Route path="/admin/facebook-dashboard" component={Facebook} />
            <Route path="/facebook-analytics" component={FacebookAnalytics} />
            <Route path="/facebook-setup" component={FacebookSetup} />
            <Route path="/facebook-conversions" component={FacebookConversions} />
            <Route path="/facebook-ads" component={FacebookAds} />
            <Route path="/marketing-api" component={MarketingAPI} />
            <Route path="/restrictions" component={RestrictionMonitor} />
            <Route path="/employees" component={EmployeeMonitor} />
            <Route path="/competitors" component={CompetitorAnalysis} />
            <Route path="/insights" component={AIInsights} />
            <Route path="/hybrid-ai" component={HybridAI} />
            <Route path="/ml-intelligence" component={MLIntelligence} />
            <Route path="/system-health" component={SystemHealth} />
            <Route path="/settings" component={Settings} />
          </Switch>
        </AppLayout>
      ) : null}
      <Route component={() => <Landing />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;