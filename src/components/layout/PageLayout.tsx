
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  showHomeButton?: boolean;
  actions?: React.ReactNode;
  contentClass?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showHomeButton = true,
  actions,
  contentClass
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm sticky top-0 z-10">
        <div className="container py-2 sm:py-3 lg:py-4 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
              <Logo size={isMobile ? "sm" : "md"} />
              <div className="h-4 sm:h-6 w-px bg-border mx-1 sm:mx-2 hidden sm:block" />
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium truncate">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {actions}
              {showHomeButton && (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => navigate("/")}
                  className="border-border/40 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className={cn("flex-1 py-4 sm:py-6 lg:py-8", contentClass)}>
        <div className="container max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-border/40 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
        <div className="container mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          MonteSite CRM © {new Date().getFullYear()} - Gerenciamento de projetos
        </div>
      </footer>
    </div>
  );
};
