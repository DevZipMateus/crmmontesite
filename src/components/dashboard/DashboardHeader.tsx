
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

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10 fixed w-full">
      <div className="container max-w-[1920px] mx-auto py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
            <Logo size={isMobile ? "sm" : "md"} />
            {!isMobile && (
              <p className="text-gray-500 mt-1 text-sm lg:text-base xl:text-lg hidden sm:block truncate">
                Gerencie e personalize sites de forma eficiente
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-sm text-xs sm:text-sm lg:text-base px-3 py-2 sm:px-4 lg:px-6 whitespace-nowrap" 
              onClick={() => navigate("/projetos")}
            >
              <LayoutDashboard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {isMobile ? "Dashboard" : "Ver Projetos"}
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base px-3 py-2 sm:px-4 lg:px-6"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
