import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  return <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="container max-w-7xl mx-auto py-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <p className="text-gray-500 mt-1 hidden md:block">Gerencie e personalize sites de forma eficiente</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => navigate("/projetos")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard Completo
          </Button>
        </div>
      </div>
    </header>;
};
export default DashboardHeader;