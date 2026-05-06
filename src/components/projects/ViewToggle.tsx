import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "list" | "kanban";
  setViewMode: (mode: "list" | "kanban") => void;
}

export default function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
      <Button
        variant={viewMode === "kanban" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("kanban")}
        className="h-7 px-2.5 text-xs gap-1.5"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Kanban
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("list")}
        className="h-7 px-2.5 text-xs gap-1.5"
      >
        <List className="h-3.5 w-3.5" />
        Lista
      </Button>
    </div>
  );
}
