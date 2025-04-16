
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import MainMenuSection from "@/components/dashboard/MainMenuSection";
import StatsSection from "@/components/dashboard/StatsSection";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      localStorage.removeItem('isLoggedIn');
      window.location.reload(); // Recarregar a página para atualizar o estado
    } else {
      navigate('/login');
    }
  };

  return <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <DashboardHeader />

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-0 mt-16">
        <div className="mb-10 flex justify-end">
          <Button onClick={handleLoginLogout} variant="outline" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            {isLoggedIn ? 'Sair' : 'Entrar'}
          </Button>
        </div>
        <MainMenuSection />
        <StatsSection />
      </main>

      <DashboardFooter />
    </div>;
};
export default Index;
