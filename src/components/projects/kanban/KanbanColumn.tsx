import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Project } from "@/types/project";
import { useNavigate } from "react-router-dom";

interface KanbanColumnProps {
  statusType: {
    value: string;
    icon: string;
    color: string;
  };
  projects: Project[];
  draggingId: string | null;
  updatingStatus: string | null;
  onDragOver: (e: React.DragEvent, status: string) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragStart: (id: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  statusOptions: Array<{value: string; color: string}>;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
}

const statusDotColors: Record<string, string> = {
  "Recebido": "bg-blue-500",
  "Victor": "bg-blue-600",
  "Davi": "bg-purple-500",
  "Sem retorno": "bg-red-500",
  "Site pronto": "bg-emerald-500",
};

export default function KanbanColumn({
  statusType,
  projects,
  draggingId,
  updatingStatus,
  onDragOver,
  onDrop,
  onDragStart,
  onStatusChange,
  statusOptions,
  onProjectDeleted,
  onProjectUpdated
}: KanbanColumnProps) {
  const filteredProjects = projects.filter(
    (project) => project.status === statusType.value
  );
  const navigate = useNavigate();
  const dotColor = statusDotColors[statusType.value] || "bg-muted-foreground";

  return (
    <div
      onDragOver={(e) => onDragOver(e, statusType.value)}
      onDrop={(e) => onDrop(e, statusType.value)}
      className="flex flex-col h-full"
      role="region"
      aria-label={`Coluna ${statusType.value}`}
    >
      {/* Column header - matches mockup: dot + name + count + "+" */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <span className="text-sm font-semibold text-foreground">{statusType.value}</span>
        <span className="text-sm text-muted-foreground font-medium">{filteredProjects.length}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-auto text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/novo-projeto')}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {filteredProjects.length > 0 ? (
        <ScrollArea className="flex-grow pr-1">
          <div className="flex flex-col gap-2.5" role="list">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                statusOptions={statusOptions}
                onDragStart={onDragStart}
                onStatusChange={onStatusChange}
                updatingStatus={updatingStatus}
                onProjectDeleted={onProjectDeleted}
                onProjectUpdated={onProjectUpdated}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div 
          className="flex-grow flex items-center justify-center border border-dashed border-border/50 rounded-lg bg-muted/20 p-6 min-h-[120px]"
        >
          <p className="text-muted-foreground text-xs">Sem projetos</p>
        </div>
      )}
    </div>
  );
}
