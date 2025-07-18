
import { Eye, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import DeleteProjectDialog from "../DeleteProjectDialog";
import { ClientTypeBadge } from "@/components/projects/ClientTypeBadge";
import { LeadLinkIndicator } from "../LeadLinkIndicator";
import { Project } from "@/types/project";

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  onProjectDeleted?: () => void;
}

export default function ProjectTable({
  projects,
  loading,
  statusFilter,
  setStatusFilter,
  onProjectDeleted,
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
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px] text-xs lg:text-sm">Nome do cliente</TableHead>
              <TableHead className="min-w-[120px] text-xs lg:text-sm">Lead Vinculado</TableHead>
              <TableHead className="min-w-[120px] text-xs lg:text-sm">Tipo de cliente</TableHead>
              <TableHead className="min-w-[140px] text-xs lg:text-sm">Modelo escolhido</TableHead>
              <TableHead className="min-w-[100px] text-xs lg:text-sm">Status</TableHead>
              <TableHead className="min-w-[120px] text-xs lg:text-sm">Data de criação</TableHead>
              <TableHead className="min-w-[120px] text-xs lg:text-sm">Responsável</TableHead>
              <TableHead className="text-right min-w-[120px] text-xs lg:text-sm">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-xs lg:text-sm">{project.client_name}</TableCell>
                <TableCell>
                  {project.lead_id ? (
                    <LeadLinkIndicator project={project} />
                  ) : (
                    <span className="text-gray-400 text-xs lg:text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <ClientTypeBadge project={project} />
                </TableCell>
                <TableCell className="text-xs lg:text-sm">{project.template || '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={project.status || 'Recebido'} />
                </TableCell>
                <TableCell className="text-xs lg:text-sm">{formatDate(project.created_at)}</TableCell>
                <TableCell className="text-xs lg:text-sm">{project.responsible_name || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 lg:gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewEdit(project.id, 'view')}
                      title="Visualizar"
                      className="h-8 w-8 lg:h-9 lg:w-9"
                    >
                      <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewEdit(project.id, 'edit')}
                      title="Editar"
                      className="h-8 w-8 lg:h-9 lg:w-9"
                    >
                      <PenSquare className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <DeleteProjectDialog 
                      projectId={project.id} 
                      projectName={project.client_name}
                      size="sm"
                      variant="icon"
                      onDelete={onProjectDeleted}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
