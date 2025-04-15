
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, Code, Globe, Clock, CheckCircle2 } from "lucide-react";
import ProjectCard from "./ProjectCard";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

interface StatusType {
  value: string;
  color: string;
}

interface KanbanColumnProps {
  statusType: StatusType;
  projects: Project[];
  draggingId: string | null;
  updatingStatus: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, newStatus: string) => void;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  statusOptions: StatusType[];
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
}: KanbanColumnProps) {
  const StatusIcon = statusType.value === "Recebido" ? Inbox :
                    statusType.value === "Criando site" ? Code :
                    statusType.value === "Configurando Domínio" ? Globe :
                    statusType.value === "Aguardando DNS" ? Clock : CheckCircle2;
  
  const filteredProjects = projects.filter(project => project.status === statusType.value);
  
  return (
    <Card 
      className="flex flex-col h-full"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, statusType.value)}
    >
      <CardHeader className={`${statusType.color} text-white rounded-t-lg`}>
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-5 w-5" />
          <CardTitle className="text-lg">{statusType.value}</CardTitle>
          <div className="flex-1" />
          <span className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
            {filteredProjects.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[70vh] p-2">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Nenhum projeto
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDragStart={onDragStart}
                onStatusChange={onStatusChange}
                draggingId={draggingId}
                updatingStatus={updatingStatus}
                statusOptions={statusOptions}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
