
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
import { useNotifications } from "@/components/dashboard/useNotifications";

const Index: React.FC = () => {
  const { projects, loading } = useProjects();
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  const chartData = useStatusChartData(projects);
  const { notifications, markNotificationAsRead, dismissNotification } = useNotifications();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        
        <MainMenuSection />
        <StatsSection />
        
        <AnalyticsSection projects={projects} />
        
        <InfoCardsSection 
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onDismiss={dismissNotification}
          projects={projects}
        />
        
        <ProjectsAnalysisSection chartData={chartData} />
      </main>

      <DashboardFooter />
    </div>
  );
}

export default Index;
