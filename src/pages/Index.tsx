
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <DashboardHeader />

      {/* Main Content */}
      <main className="flex-1 container py-10 max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bem-vindo ao CRM MonteSite</h2>
          <p className="text-gray-500">Gerencie seus projetos e sites de forma eficiente</p>
        </div>
        <MainMenuSection />
        <StatsSection />
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Index;
