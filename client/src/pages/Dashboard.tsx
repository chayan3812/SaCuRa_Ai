import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MetricsCards from "@/components/dashboard/MetricsCards";
import AdPerformanceChart from "@/components/dashboard/AdPerformanceChart";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import CustomerServiceMonitor from "@/components/dashboard/CustomerServiceMonitor";
import EmployeeMonitor from "@/components/dashboard/EmployeeMonitor";
import ConnectedAccounts from "@/components/dashboard/ConnectedAccounts";
import AILearningProgress from "@/components/dashboard/AILearningProgress";
import QuickActions from "@/components/dashboard/QuickActions";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import RealTimeAlerts from "@/components/RealTimeAlerts";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/types";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const defaultMetrics: DashboardMetrics = {
    totalSpend: 0,
    totalResponses: 0,
    preventedRestrictions: 0,
    avgResponseTime: 0,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        
        <div className="p-6 space-y-6">
          {/* Key Metrics Cards */}
          <MetricsCards 
            metrics={metrics || defaultMetrics} 
            isLoading={metricsLoading} 
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ad Performance Chart */}
            <AdPerformanceChart />

            {/* AI Recommendations */}
            <AIRecommendations />
          </div>

          {/* Live Monitoring Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Service Dashboard */}
            <CustomerServiceMonitor />

            {/* Employee Performance Monitor */}
            <EmployeeMonitor />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connected Facebook Accounts */}
            <ConnectedAccounts />

            {/* AI Learning Progress */}
            <AILearningProgress />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </main>

      {/* Floating Components */}
      <FloatingAIAssistant />
      <RealTimeAlerts />
    </div>
  );
}
