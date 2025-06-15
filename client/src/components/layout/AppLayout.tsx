import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import RealTimeAlerts from "@/components/RealTimeAlerts";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {children}
        </div>

        <FloatingAIAssistant />
        <RealTimeAlerts />
      </main>
    </div>
  );
}