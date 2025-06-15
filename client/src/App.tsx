import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { initializeWebSocket } from "@/lib/websocket";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import AdOptimizer from "@/pages/AdOptimizer";
import CustomerService from "@/pages/CustomerService";
import SmartInbox from "@/pages/SmartInbox";
import RestrictionMonitor from "@/pages/RestrictionMonitor";
import EmployeeMonitor from "@/pages/EmployeeMonitor";
import CompetitorAnalysis from "@/pages/CompetitorAnalysis";
import AIInsights from "@/pages/AIInsights";
import AIPerformance from "@/pages/AIPerformance";
import FeedbackAnalytics from "@/pages/FeedbackAnalytics";
import AITraining from "@/pages/AITraining";
import AITestDashboard from "@/pages/AITestDashboard";
import AISelfOptimizer from "@/pages/AISelfOptimizer";
import AIVersionManager from "@/pages/AIVersionManager";
import AIModelDashboard from "@/pages/AIModelDashboard";
import HybridAI from "@/pages/HybridAI";
import MLIntelligence from "@/pages/MLIntelligence";
import AutoPoster from "@/pages/AutoPoster";
import PageStatus from "@/pages/PageStatus";
import ContentQueue from "@/pages/ContentQueue";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import SystemHealth from "@/pages/SystemHealth";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Initialize WebSocket connection when user is authenticated
      initializeWebSocket(user.id);
    }
  }, [isAuthenticated, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading PagePilot AI...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={() => { window.location.href = '/api/login'; return null; }} />
          <Route component={() => <Landing />} />
        </>
      ) : (
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/ads" component={AdOptimizer} />
            <Route path="/auto-poster" component={AutoPoster} />
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
            <Route path="/restrictions" component={RestrictionMonitor} />
            <Route path="/employees" component={EmployeeMonitor} />
            <Route path="/competitors" component={CompetitorAnalysis} />
            <Route path="/insights" component={AIInsights} />
            <Route path="/hybrid-ai" component={HybridAI} />
            <Route path="/ml-intelligence" component={MLIntelligence} />
            <Route path="/system-health" component={SystemHealth} />
            <Route path="/settings" component={Settings} />
            <Route component={() => <Dashboard />} />
          </Switch>
        </AppLayout>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
