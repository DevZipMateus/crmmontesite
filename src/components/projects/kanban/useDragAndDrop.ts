
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateProjectStatus } from "@/lib/supabase/projectStatus";
import { updateProject } from "@/server/project/update-project";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
  domain?: string;
}

interface UseDragAndDropProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onDomainRequired?: (projectId: string, newStatus: string, projectName: string) => void;
}

export function useDragAndDrop({ projects, setProjects, onDomainRequired }: UseDragAndDropProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragStart = (projectId: string, e?: React.DragEvent) => {
    setDraggingId(projectId);
    if (e?.dataTransfer) {
      try {
        e.dataTransfer.setData('text/plain', projectId);
        e.dataTransfer.effectAllowed = 'move';
      } catch {}
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    const transferId = (() => {
      try { return e.dataTransfer.getData('text/plain') || null; } catch { return null; }
    })();
    const projectId = transferId || draggingId;
    
    if (!projectId) return;
    
    const project = projects.find(p => p.id === projectId);
    if (project?.status === newStatus) {
      setDraggingId(null);
      return;
    }

    // Verificar se é mudança para "Site pronto" e se precisa de domínio
    if (newStatus === "Site pronto" && project && !project.domain?.trim()) {
      if (onDomainRequired) {
        onDomainRequired(projectId, newStatus, project.client_name);
      }
      setDraggingId(null);
      return;
    }

    // Proceder com a mudança de status normalmente
    await executeStatusChange(projectId, newStatus);
    setDraggingId(null);
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Verificar se é mudança para "Site pronto" e se precisa de domínio
    if (newStatus === "Site pronto" && !project.domain?.trim()) {
      if (onDomainRequired) {
        onDomainRequired(projectId, newStatus, project.client_name);
      }
      return;
    }

    // Proceder com a mudança de status normalmente
    await executeStatusChange(projectId, newStatus);
  };

  const executeStatusChange = async (projectId: string, newStatus: string) => {
    setUpdatingStatus(projectId);
    
    try {
      console.log(`Atualizando status do projeto ${projectId} para ${newStatus}`);
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
        console.error('Erro ao atualizar status:', result.error);
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
      setUpdatingStatus(null);
    }
  };

  return {
    draggingId,
    updatingStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange
  };
}
