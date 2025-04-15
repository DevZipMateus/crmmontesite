
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main Content */}
      <main className="container py-10 max-w-7xl mx-auto">
        <MainMenuSection />
        <StatsSection />
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Index;
