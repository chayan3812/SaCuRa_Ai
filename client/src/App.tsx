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
import RestrictionMonitor from "@/pages/RestrictionMonitor";
import EmployeeMonitor from "@/pages/EmployeeMonitor";
import CompetitorAnalysis from "@/pages/CompetitorAnalysis";
import AIInsights from "@/pages/AIInsights";
import AutoPoster from "@/pages/AutoPoster";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize WebSocket connection when user is authenticated
      initializeWebSocket(user.id);
    }
  }, [isAuthenticated, user]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/ads" component={AdOptimizer} />
          <Route path="/auto-poster" component={AutoPoster} />
          <Route path="/customer-service" component={CustomerService} />
          <Route path="/restrictions" component={RestrictionMonitor} />
          <Route path="/employees" component={EmployeeMonitor} />
          <Route path="/competitors" component={CompetitorAnalysis} />
          <Route path="/insights" component={AIInsights} />
        </>
      )}
      <Route component={NotFound} />
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
