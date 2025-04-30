
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { useProjects } from "@/hooks/use-projects";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { InfoCardsSection } from "@/components/dashboard/InfoCardsSection";
import { cleanupRealtimeSubscriptions } from "@/lib/supabase/realtime";

const Index: React.FC = () => {
  const { projects, loading } = useProjects();
  const [mounted, setMounted] = useState(false);
  
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

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 py-6 mt-16 pb-16">
        <MainMenuSection />
        <StatsSection />
        
        <AnalyticsSection projects={projects} />
        
        <InfoCardsSection 
          projects={projects}
        />
      </main>

      <DashboardFooter />
    </div>
  );
}

export default Index;
