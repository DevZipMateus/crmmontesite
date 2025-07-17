
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10 fixed w-full">
      <div className="container max-w-[1920px] mx-auto py-0 px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size={isMobile ? "md" : "xl"} />
            {!isMobile && <p className="text-gray-500 mt-1 text-base">Gerencie e personalize sites de forma eficiente</p>}
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 shadow-sm text-sm px-6 py-2 whitespace-nowrap" onClick={() => navigate("/projetos")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {isMobile ? "Dashboard" : "Ver Projetos"}
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center gap-2 text-sm px-6 py-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>;
};

export default DashboardHeader;
