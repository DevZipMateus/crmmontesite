
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanBoard from "@/components/projects/KanbanBoard";
import ProjectListView from "@/components/projects/ProjectListView";
import ViewToggle from "@/components/projects/ViewToggle";
import SearchInput from "@/components/projects/SearchInput";
import { useProjects } from "@/hooks/use-projects";
import { PageLayout } from "@/components/layout/PageLayout";

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

  const handleNewProject = () => {
    navigate('/novo-projeto');
  };

  const handleProjectDeleted = () => {
    // Refresh projects after deletion
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
    <PageLayout 
      title="Projetos"
      actions={
        <>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <Button 
            onClick={handleNewProject} 
            className="bg-primary shadow-sm flex items-center gap-2"
            aria-label="Criar novo site"
          >
            <Plus className="h-4 w-4" /> Novo site
          </Button>
        </>
      }
    >
      <div className="mb-6">
        <SearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Buscar por nome do cliente, modelo ou responsável..."
          className="rounded-xl shadow-sm"
        />
      </div>

      {viewMode === "kanban" ? (
        <KanbanBoard 
          projects={projects} 
          setProjects={setProjects} 
          onProjectDeleted={handleProjectDeleted} 
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
    </PageLayout>
  );
}
