
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

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
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm sticky top-0 z-10">
        <div className="container py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="lg" />
              <div className="h-6 w-px bg-border mx-2" />
              <h1 className="text-xl font-medium">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              {showHomeButton && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/")}
                  className="ml-2 border-border/40"
                >
                  <Home className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className={cn("flex-1 py-6", contentClass)}>
        <div className="container max-w-7xl mx-auto px-4">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t border-border/40 py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          MonteSite CRM © {new Date().getFullYear()} - Gerenciamento de projetos
        </div>
      </footer>
    </div>
  );
};
