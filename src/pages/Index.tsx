
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useProjects } from "@/hooks/use-projects";
import { useTheme } from "next-themes";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { InfoCardsSection } from "@/components/dashboard/InfoCardsSection";
import { ProjectsAnalysisSection } from "@/components/dashboard/ProjectsAnalysisSection";
import { useStatusChartData } from "@/components/dashboard/useStatusChartData";
import { useNotifications } from "@/hooks/useNotifications";
import { enableRealtimeForProjects, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const { projects, loading } = useProjects();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  const chartData = useStatusChartData(projects);
  const { notifications, markNotificationAsRead, dismissNotification, addTestNotification, clearAllNotifications } = useNotifications();
  
  useEffect(() => {
    console.log("Index - Current notifications:", notifications);
  }, [notifications]);
  
  useEffect(() => {
    setMounted(true);
    
    const initRealtime = async () => {
      console.log('Initializing realtime on Index page...');
      
      const existingChannels = supabase.getChannels();
      console.log('Existing channels:', existingChannels.length);
      
      existingChannels.forEach(ch => {
        if (ch.topic === 'project-status-updates') {
          console.log('Removing existing project-status-updates channel in Index');
          supabase.removeChannel(ch);
        }
      });
      
      const channel = await enableRealtimeForProjects();
      console.log('Realtime initialized on Index page:', channel ? 'Success' : 'Failed');
    };
    
    initRealtime();
    
    return () => {
      console.log('Index page unmounting - cleaning up realtime subscriptions');
      const existingChannels = supabase.getChannels();
      existingChannels.forEach(ch => {
        if (ch.topic === 'project-status-updates') {
          supabase.removeChannel(ch);
        }
      });
    };
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addTestNotification}>
              Adicionar notificação teste
            </Button>
          </div>
          <ThemeToggle />
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
