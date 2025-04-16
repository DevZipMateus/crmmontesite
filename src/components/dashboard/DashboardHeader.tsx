import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { useIsMobile } from "@/hooks/use-mobile";
const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  return <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10 fixed w-full">
      <div className="container max-w-7xl mx-auto py-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Logo size={isMobile ? "md" : "xl"} />
            {!isMobile && <p className="text-gray-500 mt-1 hidden md:block">Gerencie e personalize sites de forma eficiente</p>}
          </div>
          <Button className="bg-primary hover:bg-primary/90 shadow-sm text-xs md:text-sm whitespace-nowrap" onClick={() => navigate("/projetos")}>
            <LayoutDashboard className="mr-1 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            {isMobile ? "Dashboard" : "Ver Projetos"}
          </Button>
        </div>
      </div>
    </header>;
};
export default DashboardHeader;