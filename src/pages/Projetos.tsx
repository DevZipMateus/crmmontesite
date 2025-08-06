
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanBoard from "@/components/projects/KanbanBoard";
import ProjectListView from "@/components/projects/ProjectListView";
import ViewToggle from "@/components/projects/ViewToggle";
import SearchInput from "@/components/projects/SearchInput";
import { AutoLinkingButton } from "@/components/projects/AutoLinkingButton";
import { useProjects } from "@/hooks/use-projects";
import { PageLayout } from "@/components/layout/PageLayout";
import { useDebounce } from "@/hooks/useDebounce";

export default function Projetos() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);
  
  const navigate = useNavigate();
  
  // Atualização dos filtros para o hook
  const filters = {
    statusFilter,
    responsibleFilter,
    domainFilter,
    dateFromFilter,
    dateToFilter,
    searchQuery
  };
  
  const { projects, setProjects, loading, fetchProjects } = useProjects(filters);

  const handleNewProject = useCallback(() => {
    navigate('/novo-projeto');
  }, [navigate]);
  
  const debouncedHandleNewProject = useDebounce(handleNewProject, 1000);

  const handleProjectDeleted = () => {
    // Refresh projects after deletion
    fetchProjects();
  };

  const handleProjectUpdated = () => {
    // Refresh projects after update
    fetchProjects();
  };

  const handleLinkingComplete = () => {
    // Refresh projects after linking
    fetchProjects();
  };

  const handleFilterChange = (filter: string, value: string | null | Date) => {
    switch (filter) {
      case 'status':
        setStatusFilter(value as string | null);
        break;
      case 'responsible':
        setResponsibleFilter(value as string);
        break;
      case 'domain':
        setDomainFilter(value as string);
        break;
      case 'dateFrom':
        setDateFromFilter(value as Date);
        break;
      case 'dateTo':
        setDateToFilter(value as Date);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageLayout 
        title="Projetos"
        actions={
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <AutoLinkingButton onLinkingComplete={handleLinkingComplete} />
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <Button 
              onClick={debouncedHandleNewProject} 
              className="bg-primary shadow-sm flex items-center gap-2 px-3 lg:px-4 text-sm lg:text-base"
              aria-label="Criar novo site"
            >
              <Plus className="h-4 w-4" /> 
              <span className="hidden sm:inline">Novo site</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          <div className="w-full">
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Buscar por nome do cliente, modelo ou responsável..."
              className="rounded-xl shadow-sm w-full"
            />
          </div>

          <div className="w-full overflow-hidden">
            {viewMode === "kanban" ? (
              <KanbanBoard 
                projects={projects} 
                setProjects={setProjects} 
                onProjectDeleted={handleProjectDeleted}
                onProjectUpdated={handleProjectUpdated}
                searchQuery={searchQuery}
              />
            ) : (
              <ProjectListView 
                projects={projects}
                loading={loading}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onProjectDeleted={handleProjectDeleted}
              />
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
