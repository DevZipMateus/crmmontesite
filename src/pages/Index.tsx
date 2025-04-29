
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { useProjects } from "@/hooks/use-projects";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { InfoCardsSection } from "@/components/dashboard/InfoCardsSection";
import { ProjectsAnalysisSection } from "@/components/dashboard/ProjectsAnalysisSection";
import { useStatusChartData } from "@/components/dashboard/useStatusChartData";
import { useNotifications } from "@/hooks/useNotifications";
import { cleanupRealtimeSubscriptions } from "@/lib/supabase/realtime";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const { projects, loading } = useProjects();
  const [mounted, setMounted] = useState(false);
  
  const chartData = useStatusChartData(projects);
  const { notifications, markNotificationAsRead, dismissNotification, addTestNotification, clearAllNotifications } = useNotifications();
  
  useEffect(() => {
    console.log("Index - Current notifications:", notifications);
  }, [notifications]);
  
  useEffect(() => {
    setMounted(true);
    
    const initApp = async () => {
      console.log('[Index] Initializing app on Index page...');
      // Clean up any existing channels to avoid duplication
      cleanupRealtimeSubscriptions();
    };
    
    initApp();
    
    return () => {
      console.log('[Index] Index page unmounting - cleaning up realtime subscriptions');
      cleanupRealtimeSubscriptions();
    };
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addTestNotification}>
              Adicionar notificação teste
            </Button>
          </div>
        </div>
        
        <MainMenuSection />
        <StatsSection />
        
        <AnalyticsSection projects={projects} />
        
        <InfoCardsSection 
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onDismiss={dismissNotification}
          onClearAll={clearAllNotifications}
          projects={projects}
        />
        
        <ProjectsAnalysisSection chartData={chartData} />
      </main>

      <DashboardFooter />
    </div>
  );
}

export default Index;
