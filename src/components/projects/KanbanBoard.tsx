
import { PROJECT_STATUS_TYPES } from "@/lib/supabase";
import KanbanColumn from "./kanban/KanbanColumn";
import { useDragAndDrop } from "./kanban/useDragAndDrop";

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
  const {
    draggingId,
    updatingStatus,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange
  } = useDragAndDrop(projects, setProjects);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {PROJECT_STATUS_TYPES.map((statusType) => (
        <KanbanColumn
          key={statusType.value}
          statusType={statusType}
          projects={projects}
          draggingId={draggingId}
          updatingStatus={updatingStatus}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onStatusChange={handleStatusChange}
          statusOptions={PROJECT_STATUS_TYPES}
        />
      ))}
    </div>
  );
}
