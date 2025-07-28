import { PROJECT_STATUS_TYPES } from "@/lib/supabase/projectStatus";
import KanbanColumn from "./kanban/KanbanColumn";
import { useDragAndDrop } from "./kanban/useDragAndDrop";
import { useStatusChangeWithDomain } from "@/hooks/use-status-change-with-domain";
import { DomainRequiredDialog } from "./DomainRequiredDialog";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Project } from "@/types/project";

interface KanbanBoardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onProjectDeleted?: () => void;
  onProjectUpdated?: () => void;
  searchQuery?: string;
}

export default function KanbanBoard({ 
  projects, 
  setProjects, 
  onProjectDeleted, 
  onProjectUpdated,
  searchQuery = "" 
}: KanbanBoardProps) {
  const {
    domainDialogOpen,
    pendingStatusChange,
    isUpdating,
    handleStatusChange,
    handleDomainConfirm,
    handleDomainCancel
  } = useStatusChangeWithDomain({ projects, setProjects });

  const {
    draggingId,
    updatingStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange: handleDragStatusChange
  } = useDragAndDrop({ 
    projects, 
    setProjects, 
    onDomainRequired: (projectId, newStatus, projectName) => {
      handleStatusChange(projectId, newStatus);
    }
  });
  
  const isMobile = useIsMobile();
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [projectsWithCustomizationStatus, setProjectsWithCustomizationStatus] = useState<Project[]>([]);
  
  useEffect(() => {
    if (projects.length === 0) {
      setProjectsWithCustomizationStatus([]);
      return;
    }

    const checkCustomizations = async () => {
      try {
        const { data: customizations, error } = await supabase
          .from("project_customizations")
          .select("project_id")
          .in("status", ["Solicitado", "Em andamento"]);

        if (error) {
          console.error("Erro ao buscar customizações:", error);
          return;
        }

        const projectsWithPendingCustomizations = new Set(
          customizations.map(c => c.project_id)
        );

        let updatedProjects = [...projects].map(project => ({
          ...project,
          hasPendingCustomizations: projectsWithPendingCustomizations.has(project.id)
        }));

        // Filtrar projetos arquivados apenas se não houver busca ativa
        const hasActiveSearch = searchQuery.trim().length > 0;
        if (!hasActiveSearch) {
          updatedProjects = updatedProjects.filter(project => {
            // Para "Site pronto", filtrar arquivados
            if (project.status === "Site pronto" && project.isArchived) {
              return false;
            }
            return true;
          });
        }

        updatedProjects = updatedProjects.sort((a, b) => {
          if (a.hasPendingCustomizations && !b.hasPendingCustomizations) return -1;
          if (!a.hasPendingCustomizations && b.hasPendingCustomizations) return 1;
          
          return 0;
        });

        setProjectsWithCustomizationStatus(updatedProjects);
      } catch (error) {
        console.error("Erro ao processar customizações:", error);
      }
    };

    checkCustomizations();
  }, [projects, searchQuery]);
  
  const displayProjects = projectsWithCustomizationStatus.length > 0 
    ? projectsWithCustomizationStatus 
    : projects;
  
  const handleNextColumn = () => {
    setActiveColumnIndex((prev) => 
      prev < PROJECT_STATUS_TYPES.length - 1 ? prev + 1 : prev
    );
  };
  
  const handlePrevColumn = () => {
    setActiveColumnIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  const handleProjectDeleted = () => {
    if (onProjectDeleted) {
      onProjectDeleted();
    }
  };

  const handleProjectUpdated = () => {
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  const handleUnifiedStatusChange = (projectId: string, newStatus: string) => {
    handleStatusChange(projectId, newStatus);
  };

  if (isMobile) {
    const currentStatusType = PROJECT_STATUS_TYPES[activeColumnIndex];
    
    return (
      <div className="relative w-full">
        <div className="flex justify-between items-center mb-3 sm:mb-4 px-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevColumn}
            disabled={activeColumnIndex === 0}
            className="h-8 sm:h-10 px-2 sm:px-4 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <span className="text-sm sm:text-base lg:text-lg font-medium text-center px-2 truncate">
            {currentStatusType.value} ({activeColumnIndex + 1}/{PROJECT_STATUS_TYPES.length})
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextColumn}
            disabled={activeColumnIndex === PROJECT_STATUS_TYPES.length - 1}
            className="h-8 sm:h-10 px-2 sm:px-4 flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        
        <div className="w-full px-1">
          <KanbanColumn
            key={currentStatusType.value}
            statusType={currentStatusType}
            projects={displayProjects}
            draggingId={draggingId}
            updatingStatus={updatingStatus || (isUpdating ? pendingStatusChange?.projectId || null : null)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onStatusChange={handleUnifiedStatusChange}
            statusOptions={PROJECT_STATUS_TYPES}
            onProjectDeleted={handleProjectDeleted}
            onProjectUpdated={handleProjectUpdated}
          />
        </div>

        <DomainRequiredDialog
          open={domainDialogOpen}
          onClose={handleDomainCancel}
          onConfirm={handleDomainConfirm}
          projectName={pendingStatusChange?.projectName || ""}
          isLoading={isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ScrollArea className="w-full h-[calc(100vh-280px)] lg:h-[calc(100vh-240px)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 p-1">
          {PROJECT_STATUS_TYPES.map((statusType) => (
            <div key={statusType.value} className="min-w-[240px] md:min-w-[260px] lg:min-w-[280px] xl:min-w-[300px] 2xl:min-w-[320px]">
              <KanbanColumn
                statusType={statusType}
                projects={displayProjects}
                draggingId={draggingId}
                updatingStatus={updatingStatus || (isUpdating ? pendingStatusChange?.projectId || null : null)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onStatusChange={handleUnifiedStatusChange}
                statusOptions={PROJECT_STATUS_TYPES}
                onProjectDeleted={handleProjectDeleted}
                onProjectUpdated={handleProjectUpdated}
              />
            </div>
          ))}
        </div>
      </ScrollArea>

      <DomainRequiredDialog
        open={domainDialogOpen}
        onClose={handleDomainCancel}
        onConfirm={handleDomainConfirm}
        projectName={pendingStatusChange?.projectName || ""}
        isLoading={isUpdating}
      />
    </div>
  );
}
