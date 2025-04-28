
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Globe, Clock, CheckCircle2, Inbox } from "lucide-react";
import ProjectCard from "./ProjectCard";

interface KanbanColumnProps {
  statusType: {
    value: string;
    icon: string;
    color: string;
  };
  projects: Array<{
    id: string;
    client_name: string;
    template: string;
    status: string;
    created_at: string;
    responsible_name?: string;
    domain?: string;
    hasPendingCustomizations?: boolean;
  }>;
  draggingId: string | null;
  updatingStatus: boolean;
  onDragOver: (e: React.DragEvent, status: string) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  statusOptions: Array<{value: string; color: string}>;
  onProjectDeleted?: () => void;
}

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
  onProjectDeleted
}: KanbanColumnProps) {
  const filteredProjects = projects.filter(
    (project) => project.status === statusType.value
  );
  
  // Determine icon component based on status
  let StatusIcon;
  switch(statusType.icon) {
    case 'Inbox': StatusIcon = Inbox; break;
    case 'Code': StatusIcon = Code; break;
    case 'Globe': StatusIcon = Globe; break;
    case 'Clock': StatusIcon = Clock; break;
    case 'CheckCircle2': StatusIcon = CheckCircle2; break;
    default: StatusIcon = Inbox;
  }

  return (
    <div
      onDragOver={(e) => onDragOver(e, statusType.value)}
      onDrop={(e) => onDrop(e, statusType.value)}
      className="flex flex-col h-full"
    >
      <div className="mb-3">
        <Card className={`p-2 ${statusType.color.replace('bg-', 'bg-opacity-10 border-l-4 border-')} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`rounded-full p-1 ${statusType.color} text-white`}>
                <StatusIcon className="h-4 w-4" />
              </div>
              <span className="font-medium">{statusType.value}</span>
            </div>
            <Badge variant="outline" className="bg-gray-50">
              {filteredProjects.length}
            </Badge>
          </div>
        </Card>
      </div>
      
      {filteredProjects.length > 0 ? (
        <ScrollArea className="flex-grow pr-3">
          <div className="flex flex-col space-y-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                draggingId={draggingId}
                updatingStatus={updatingStatus}
                onDragStart={onDragStart}
                onStatusChange={onStatusChange}
                statusOptions={statusOptions}
                onProjectDeleted={onProjectDeleted}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow flex items-center justify-center border border-dashed rounded-md bg-gray-50 p-4">
          <p className="text-gray-400 text-sm">Sem projetos</p>
        </div>
      )}
    </div>
  );
}
