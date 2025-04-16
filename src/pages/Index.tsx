
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <DashboardHeader />

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <div className="mb-10 flex justify-end">
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        <MainMenuSection />
        <StatsSection />
      </main>

      <DashboardFooter />
    </div>;
};
export default Index;
