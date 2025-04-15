
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container py-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRM MonteSite</h1>
            <p className="text-gray-500 mt-1">Gerencie e personalize sites de forma eficiente</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90" 
            onClick={() => navigate("/projetos")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard Completo
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
