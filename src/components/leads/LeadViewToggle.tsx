
import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadViewToggleProps {
  view: 'cards' | 'table';
  onViewChange: (view: 'cards' | 'table') => void;
}

const LeadViewToggle: React.FC<LeadViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
      <button
        onClick={() => onViewChange('cards')}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
          view === 'cards'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Cards
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
          view === 'table'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-3.5 w-3.5" />
        Tabela
      </button>
    </div>
  );
};

export default LeadViewToggle;
