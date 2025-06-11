import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import RealTimeAlerts from "@/components/RealTimeAlerts";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        
        <div className="p-4 md:p-6 space-y-6">
          {children}
        </div>

        <FloatingAIAssistant />
        <RealTimeAlerts />
      </main>
    </div>
  );
}