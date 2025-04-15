
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, PenSquare, Inbox, Code, Globe, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

interface ProjectCardProps {
  project: Project;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onStatusChange: (projectId: string, newStatus: string) => void;
  draggingId: string | null;
  updatingStatus: boolean;
  statusOptions: Array<{ value: string; color: string }>;
}

export default function ProjectCard({
  project,
  onDragStart,
  onStatusChange,
  draggingId,
  updatingStatus,
  statusOptions,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  return (
    <Card 
      key={project.id} 
      className={`p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${draggingId === project.id ? 'opacity-50' : ''}`}
      draggable="true"
      onDragStart={(e) => onDragStart(e, project.id)}
    >
      <div className="font-medium">{project.client_name}</div>
      <div className="text-sm text-gray-500 mt-1">
        {project.template || "Sem modelo"}
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">
          {formatDate(project.created_at)}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleViewEdit(project.id, 'view')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleViewEdit(project.id, 'edit')}
          >
            <PenSquare className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-1">
        {statusOptions.filter(s => s.value !== project.status).map(status => (
          <Button 
            key={status.value} 
            variant="ghost" 
            size="sm"
            className="text-xs h-7"
            onClick={() => onStatusChange(project.id, status.value)}
            disabled={updatingStatus}
          >
            {status.value === "Recebido" ? <Inbox className="h-3 w-3 mr-1" /> : 
             status.value === "Criando site" ? <Code className="h-3 w-3 mr-1" /> : 
             status.value === "Configurando Domínio" ? <Globe className="h-3 w-3 mr-1" /> :
             status.value === "Aguardando DNS" ? <Clock className="h-3 w-3 mr-1" /> :
             <CheckCircle2 className="h-3 w-3 mr-1" />}
            {status.value.length > 10 ? `${status.value.substring(0, 10)}...` : status.value}
          </Button>
        ))}
      </div>
    </Card>
  );
}
