
import { Card, CardContent } from "@/components/ui/card";
import StatusFilter from "./list/StatusFilter";
import ProjectTable from "./list/ProjectTable";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

interface ProjectListViewProps {
  projects: Project[];
  loading: boolean;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

export default function ProjectListView({
  projects,
  loading,
  statusFilter,
  setStatusFilter,
}: ProjectListViewProps) {
  return (
    <>
      <StatusFilter 
        statusFilter={statusFilter} 
        setStatusFilter={setStatusFilter} 
      />
      
      <Card>
        <CardContent className="p-0">
          <ProjectTable 
            projects={projects}
            loading={loading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </CardContent>
      </Card>
    </>
  );
}
