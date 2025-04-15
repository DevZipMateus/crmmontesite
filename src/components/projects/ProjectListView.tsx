
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, PenSquare, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_TYPES } from "@/lib/supabase";

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
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm font-medium">Filtrar por:</div>
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {PROJECT_STATUS_TYPES.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Nome do cliente</th>
                    <th className="text-left p-4">Modelo escolhido</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Data de criação</th>
                    <th className="text-left p-4">Responsável</th>
                    <th className="text-right p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{project.client_name}</td>
                      <td className="p-4">{project.template}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'Site pronto'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'Criando site'
                            ? 'bg-blue-100 text-blue-800'
                            : project.status === 'Recebido'
                            ? 'bg-purple-100 text-purple-800'
                            : project.status === 'Configurando Domínio'
                            ? 'bg-amber-100 text-amber-800'
                            : project.status === 'Aguardando DNS'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-4">{formatDate(project.created_at)}</td>
                      <td className="p-4">{project.responsible_name || '—'}</td>
                      <td className="p-4 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
