
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, PenSquare, Inbox, Code, Globe, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
  domain?: string;
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
  const isMobile = useIsMobile();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  return (
    <Card 
      key={project.id} 
      className={`p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${draggingId === project.id ? 'opacity-50' : ''} animate-fade-in`}
      draggable="true"
      onDragStart={(e) => onDragStart(e, project.id)}
    >
      <div className="flex flex-col space-y-1.5">
        <div className="font-medium text-primary">{project.client_name}</div>
        <div className="text-sm text-gray-500">
          {project.template || "Sem modelo"}
        </div>

        {project.domain && (
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <Globe className="h-3 w-3 mr-1 text-blue-500" />
            <span className="truncate">{project.domain}</span>
            {project.domain && (
              <a 
                href={`https://${project.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 inline-flex"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3 text-gray-400 hover:text-primary" />
              </a>
            )}
          </div>
        )}
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
      
      <div className="mt-2 pt-2 border-t">
        {isMobile ? (
          // Mobile view - dropdown-style status selector would be ideal
          <div className="grid grid-cols-2 gap-1">
            {statusOptions.filter(s => s.value !== project.status).slice(0, 2).map(status => (
              <StatusButton 
                key={status.value}
                status={status}
                onStatusChange={() => onStatusChange(project.id, status.value)}
                updatingStatus={updatingStatus}
              />
            ))}
          </div>
        ) : (
          // Desktop view - show all status options
          <div className="grid grid-cols-2 gap-1">
            {statusOptions.filter(s => s.value !== project.status).map(status => (
              <StatusButton 
                key={status.value}
                status={status}
                onStatusChange={() => onStatusChange(project.id, status.value)}
                updatingStatus={updatingStatus}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Extracted status button component for better organization
function StatusButton({ 
  status, 
  onStatusChange, 
  updatingStatus 
}: { 
  status: { value: string; color: string },
  onStatusChange: () => void, 
  updatingStatus: boolean 
}) {
  const StatusIcon = status.value === "Recebido" ? Inbox : 
                     status.value === "Criando site" ? Code : 
                     status.value === "Configurando Domínio" ? Globe :
                     status.value === "Aguardando DNS" ? Clock :
                     CheckCircle2;

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-xs h-7"
      onClick={onStatusChange}
      disabled={updatingStatus}
    >
      <StatusIcon className="h-3 w-3 mr-1" />
      {status.value.length > 10 ? `${status.value.substring(0, 10)}...` : status.value}
    </Button>
  );
}
