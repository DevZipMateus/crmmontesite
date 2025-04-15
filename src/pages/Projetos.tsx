
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
  const navigate = useNavigate();
  const { projects, setProjects, loading } = useProjects(statusFilter, searchQuery);

  const handleNewProject = () => {
    navigate('/novo-projeto');
  };

  return (
    <PageLayout 
      title="Projetos"
      actions={
        <>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <Button onClick={handleNewProject} className="bg-primary shadow-sm flex items-center gap-2">
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
        <KanbanBoard projects={projects} setProjects={setProjects} />
      ) : (
        <ProjectListView 
          projects={projects}
          loading={loading}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      )}
    </PageLayout>
  );
}
