import React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  breadcrumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export function TopBar({ breadcrumbs, actions }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-white px-4">
      <SidebarTrigger className="h-8 w-8" />

      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="mx-1 text-muted-foreground/50">›</span>}
            {crumb.href ? (
              <button
                onClick={() => navigate(crumb.href!)}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex-1" />

      {actions && <div className="flex items-center gap-2">{actions}</div>}

      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
