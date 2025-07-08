import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./list/StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types/project";

interface SalesProjectTableProps {
  projects: Project[];
  loading: boolean;
}

export default function SalesProjectTable({
  projects,
  loading,
}: SalesProjectTableProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleView = (projectId: string) => {
    navigate(`/projeto/${projectId}`);
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
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do cliente</TableHead>
                <TableHead>Email</TableHead>
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
                  <TableCell>
                    {project.email_complementar || 
                     project.site_personalizacoes?.email || 
                     '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status || 'Recebido'} />
                  </TableCell>
                  <TableCell>{formatDate(project.created_at)}</TableCell>
                  <TableCell>{project.responsible_name || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleView(project.id)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}