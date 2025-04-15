
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  viewMode: "list" | "kanban";
  setViewMode: (mode: "list" | "kanban") => void;
}

export default function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md p-1 bg-muted/20">
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("list")}
        className="text-sm"
      >
        Lista
      </Button>
      <Button
        variant={viewMode === "kanban" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("kanban")}
        className="text-sm"
      >
        Kanban
      </Button>
    </div>
  );
}
