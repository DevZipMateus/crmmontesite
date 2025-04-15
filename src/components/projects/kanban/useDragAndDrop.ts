
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateProjectStatus } from "@/lib/supabase";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

export function useDragAndDrop(projects: Project[], setProjects: React.Dispatch<React.SetStateAction<Project[]>>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
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

  return {
    draggingId,
    updatingStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange
  };
}
