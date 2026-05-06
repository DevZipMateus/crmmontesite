import { Eye, PenSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import DeleteProjectDialog from "../DeleteProjectDialog";
import { ClientTypeBadge } from "@/components/projects/ClientTypeBadge";
import { LeadLinkIndicator } from "../LeadLinkIndicator";
import { Project } from "@/types/project";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-sm">Nenhum projeto encontrado.</p>
        {statusFilter && (
          <Button variant="link" size="sm" onClick={() => setStatusFilter(null)} className="mt-2 text-xs">
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/60">
            <TableHead className="text-xs font-medium text-muted-foreground">Cliente</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Lead</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Tipo</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Modelo</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Criado</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Responsavel</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id} 
              className="hover:bg-muted/40 cursor-pointer border-border/40 transition-colors"
              onClick={() => navigate(`/projeto/${project.id}`)}
            >
              <TableCell className="font-medium text-sm text-foreground">{project.client_name}</TableCell>
              <TableCell>
                {project.lead_id ? (
                  <LeadLinkIndicator project={project} />
                ) : (
                  <span className="text-muted-foreground text-xs">--</span>
                )}
              </TableCell>
              <TableCell>
                <ClientTypeBadge project={project} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{project.template || '--'}</TableCell>
              <TableCell>
                <StatusBadge status={project.status || 'Recebido'} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatDate(project.created_at)}</TableCell>
              <TableCell>
                {project.responsible_name ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                        {getInitials(project.responsible_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{project.responsible_name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">--</span>
                )}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewEdit(project.id, 'view')}
                    title="Visualizar"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewEdit(project.id, 'edit')}
                    title="Editar"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
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
  );
}
