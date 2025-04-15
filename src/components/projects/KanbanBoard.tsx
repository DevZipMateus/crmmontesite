
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, PenSquare, Inbox, Code, Globe, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PROJECT_STATUS_TYPES, updateProjectStatus } from "@/lib/supabase";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

interface KanbanBoardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export default function KanbanBoard({ projects, setProjects }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggingId(projectId);
    e.dataTransfer.setData('text/plain', projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    
    if (!projectId || !draggingId) return;
    
    const project = projects.find(p => p.id === projectId);
    if (project?.status === newStatus) {
      setDraggingId(null);
      return;
    }

    setUpdatingStatus(true);
    
    try {
      const result = await updateProjectStatus(projectId, newStatus);
      
      if (result.success) {
        toast({
          title: "Status atualizado",
          description: `Projeto movido para "${newStatus}"`,
        });
        
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId ? { ...project, status: newStatus } : project
          )
        );
      } else {
        throw new Error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do projeto.",
        variant: "destructive",
      });
    } finally {
      setDraggingId(null);
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setUpdatingStatus(true);
    
    try {
      const result = await updateProjectStatus(projectId, newStatus);
      
      if (result.success) {
        toast({
          title: "Status atualizado",
          description: `Status do projeto alterado para "${newStatus}"`,
        });
        
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId ? { ...project, status: newStatus } : project
          )
        );
      } else {
        throw new Error('Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do projeto.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {PROJECT_STATUS_TYPES.map((statusType) => {
        const StatusIcon = statusType.value === "Recebido" ? Inbox :
                          statusType.value === "Criando site" ? Code :
                          statusType.value === "Configurando Domínio" ? Globe :
                          statusType.value === "Aguardando DNS" ? Clock : CheckCircle2;
        
        const filteredProjects = projects.filter(project => project.status === statusType.value);
        
        return (
          <Card 
            key={statusType.value} 
            className="flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, statusType.value)}
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
                    <Card 
                      key={project.id} 
                      className={`p-3 shadow-sm hover:shadow-md transition-shadow cursor-move ${draggingId === project.id ? 'opacity-50' : ''}`}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, project.id)}
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
                        {PROJECT_STATUS_TYPES.filter(s => s.value !== project.status).map(status => (
                          <Button 
                            key={status.value} 
                            variant="ghost" 
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleStatusChange(project.id, status.value)}
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
