
import { Eye, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

export default function ProjectTable({
  projects,
  loading,
  statusFilter,
  setStatusFilter,
}: ProjectTableProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
        {statusFilter && (
          <Button 
            variant="link" 
            onClick={() => setStatusFilter(null)}
            className="mt-2"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do cliente</TableHead>
            <TableHead>Modelo escolhido</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{project.client_name}</TableCell>
              <TableCell>{project.template}</TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell>{formatDate(project.created_at)}</TableCell>
              <TableCell>{project.responsible_name || '—'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewEdit(project.id, 'view')}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewEdit(project.id, 'edit')}
                    title="Editar"
                  >
                    <PenSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
