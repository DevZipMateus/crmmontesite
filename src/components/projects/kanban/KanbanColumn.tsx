import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Globe, Clock, CheckCircle2, Inbox, PhoneOff } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Project } from "@/types/project";

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

const statusColorMap: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  "Recebido": { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  "Victor": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  "Davi": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  "Sem retorno": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  "Site pronto": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
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

  const colors = statusColorMap[statusType.value] || { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", border: "border-border" };

  return (
    <div
      onDragOver={(e) => onDragOver(e, statusType.value)}
      onDrop={(e) => onDrop(e, statusType.value)}
      className="flex flex-col h-full"
      role="region"
      aria-label={`Coluna ${statusType.value}`}
    >
      {/* Column header */}
      <div className={`mb-3 px-3 py-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            <span className={`text-sm font-semibold ${colors.text}`}>{statusType.value}</span>
          </div>
          <Badge variant="secondary" className="text-xs font-medium h-5 min-w-[20px] justify-center">
            {filteredProjects.length}
          </Badge>
        </div>
      </div>
      
      {filteredProjects.length > 0 ? (
        <ScrollArea className="flex-grow pr-1">
          <div className="flex flex-col gap-2.5" role="list" aria-label={`Projetos com status ${statusType.value}`}>
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
          className="flex-grow flex items-center justify-center border border-dashed border-border/60 rounded-lg bg-muted/30 p-6 min-h-[100px]"
          role="region"
          aria-label={`Nenhum projeto com status ${statusType.value}`}
        >
          <p className="text-muted-foreground text-xs">Sem projetos</p>
        </div>
      )}
    </div>
  );
}
