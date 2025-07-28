
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateProjectStatus } from "@/lib/supabase/projectStatus";
import { updateProject } from "@/server/project/update-project";
import { Project } from "@/types/project";

interface UseStatusChangeWithDomainProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export function useStatusChangeWithDomain({ projects, setProjects }: UseStatusChangeWithDomainProps) {
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    projectId: string;
    newStatus: string;
    projectName: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Se o novo status é "Site pronto" e o projeto não tem domínio, abrir modal
    if (newStatus === "Site pronto" && !project.domain?.trim()) {
      setPendingStatusChange({
        projectId,
        newStatus,
        projectName: project.client_name
      });
      setDomainDialogOpen(true);
      return;
    }

    // Caso contrário, proceder com a mudança de status normalmente
    await executeStatusChange(projectId, newStatus);
  };

  const executeStatusChange = async (projectId: string, newStatus: string) => {
    setIsUpdating(true);
    
    try {
      console.log(`Alterando status do projeto ${projectId} para ${newStatus}`);
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
      setIsUpdating(false);
    }
  };

  const handleDomainConfirm = async (domain: string) => {
    if (!pendingStatusChange) return;

    setIsUpdating(true);
    
    try {
      // Primeiro, atualizar o domínio
      const updateResult = await updateProject(pendingStatusChange.projectId, { domain });
      
      if (!updateResult.success) {
        throw new Error(updateResult.message || 'Failed to update domain');
      }

      // Depois, atualizar o status
      const statusResult = await updateProjectStatus(pendingStatusChange.projectId, pendingStatusChange.newStatus);
      
      if (!statusResult.success) {
        throw new Error('Failed to update project status');
      }

      // Atualizar o estado local
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === pendingStatusChange.projectId 
            ? { ...project, domain, status: pendingStatusChange.newStatus }
            : project
        )
      );

      toast({
        title: "Projeto finalizado",
        description: `Domínio "${domain}" adicionado e status alterado para "${pendingStatusChange.newStatus}"`,
      });

      setDomainDialogOpen(false);
      setPendingStatusChange(null);
    } catch (error) {
      console.error('Error updating project with domain:', error);
      toast({
        title: "Erro ao finalizar projeto",
        description: "Não foi possível atualizar o domínio e status do projeto.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDomainCancel = () => {
    setDomainDialogOpen(false);
    setPendingStatusChange(null);
  };

  return {
    domainDialogOpen,
    pendingStatusChange,
    isUpdating,
    handleStatusChange,
    handleDomainConfirm,
    handleDomainCancel
  };
}
