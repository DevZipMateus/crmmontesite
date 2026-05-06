import React, { useState, useEffect } from "react";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { useProjects } from "@/hooks/use-projects";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { InfoCardsSection } from "@/components/dashboard/InfoCardsSection";
import { cleanupRealtimeSubscriptions } from "@/lib/supabase/realtime";
import { TopBar } from "@/components/layout/TopBar";

const Index: React.FC = () => {
  const { projects, loading } = useProjects();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const initApp = async () => {
      console.log('[Index] Initializing app on Index page...');
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
    <div className="flex flex-col flex-1">
      <TopBar breadcrumbs={[
        { label: "MonteSite CRM", href: "/home" },
        { label: "Início" }
      ]} />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bom dia, Victor 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus projetos, leads e produção em um só lugar.
            </p>
          </div>
          
          <StatsSection />
          <MainMenuSection />
          <AnalyticsSection projects={projects} />
          <InfoCardsSection projects={projects} />
        </div>
      </main>
    </div>
  );
}

export default Index;
