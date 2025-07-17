
import { PROJECT_STATUS_TYPES } from "@/lib/supabase/projectStatus";
import KanbanColumn from "./kanban/KanbanColumn";
import { useDragAndDrop } from "./kanban/useDragAndDrop";
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
  searchQuery?: string;
}

export default function KanbanBoard({ projects, setProjects, onProjectDeleted, searchQuery = "" }: KanbanBoardProps) {
  const {
    draggingId,
    updatingStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange
  } = useDragAndDrop(projects, setProjects);
  
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

  if (isMobile) {
    const currentStatusType = PROJECT_STATUS_TYPES[activeColumnIndex];
    
    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevColumn}
            disabled={activeColumnIndex === 0}
            className="h-10 px-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <span className="text-base font-medium">
            {currentStatusType.value} ({activeColumnIndex + 1}/{PROJECT_STATUS_TYPES.length})
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextColumn}
            disabled={activeColumnIndex === PROJECT_STATUS_TYPES.length - 1}
            className="h-10 px-4"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <KanbanColumn
          key={currentStatusType.value}
          statusType={currentStatusType}
          projects={displayProjects}
          draggingId={draggingId}
          updatingStatus={updatingStatus}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onStatusChange={handleStatusChange}
          statusOptions={PROJECT_STATUS_TYPES}
          onProjectDeleted={handleProjectDeleted}
        />
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-[1600px] fhd:min-w-[1800px]">
        {PROJECT_STATUS_TYPES.map((statusType) => (
          <KanbanColumn
            key={statusType.value}
            statusType={statusType}
            projects={displayProjects}
            draggingId={draggingId}
            updatingStatus={updatingStatus}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onStatusChange={handleStatusChange}
            statusOptions={PROJECT_STATUS_TYPES}
            onProjectDeleted={handleProjectDeleted}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
