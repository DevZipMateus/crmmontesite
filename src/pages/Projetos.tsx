
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import KanbanBoard from "@/components/projects/KanbanBoard";
import ProjectListView from "@/components/projects/ProjectListView";
import ViewToggle from "@/components/projects/ViewToggle";
import { useProjects } from "@/hooks/use-projects";

export default function Projetos() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const navigate = useNavigate();
  const { projects, setProjects, loading } = useProjects(statusFilter);

  const handleNewProject = () => {
    navigate('/novo-projeto');
  };

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projetos</h1>
        <div className="flex items-center gap-4">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <Button onClick={handleNewProject} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Novo site
          </Button>
        </div>
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
    </div>
  );
}
