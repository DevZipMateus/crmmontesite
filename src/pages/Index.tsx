
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";

const Index: React.FC = () => {
  return <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <DashboardHeader />

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <MainMenuSection />
        <StatsSection />
      </main>

      <DashboardFooter />
    </div>;
};
export default Index;
