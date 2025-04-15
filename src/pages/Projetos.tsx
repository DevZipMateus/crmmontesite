
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, PenSquare, Plus, Filter, Inbox, Code, Globe, Clock, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";

// Define the Project type
interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

// Define the status types for our Kanban columns
const STATUS_TYPES = [
  { value: "Recebido", icon: Inbox, color: "bg-purple-500" },
  { value: "Criando site", icon: Code, color: "bg-blue-500" },
  { value: "Configurando Domínio", icon: Globe, color: "bg-amber-500" },
  { value: "Aguardando DNS", icon: Clock, color: "bg-orange-500" },
  { value: "Site pronto", icon: CheckCircle2, color: "bg-green-500" }
];

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban"); // Default to Kanban view
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      try {
        const supabase = getSupabaseClient();
        
        let query = supabase.from('projects').select('*');
        
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        
        if (error instanceof Error && !error.message.includes('not initialized')) {
          toast({
            title: "Erro ao buscar projetos",
            description: "Não foi possível carregar a lista de projetos.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleNewProject = () => {
    navigate('/novo-projeto');
  };

  const handleViewEdit = (projectId: string, action: 'view' | 'edit') => {
    navigate(`/projeto/${projectId}${action === 'edit' ? '/editar' : ''}`);
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Status atualizado",
        description: `Projeto movido para "${newStatus}"`,
      });
      
      // Update the local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId ? { ...project, status: newStatus } : project
        )
      );
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do projeto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render Kanban board with columns for each status
  const renderKanbanBoard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_TYPES.map((statusType) => {
          const StatusIcon = statusType.icon;
          const filteredProjects = projects.filter(project => project.status === statusType.value);
          
          return (
            <Card key={statusType.value} className="flex flex-col h-full">
              <CardHeader className={`${statusType.color} text-white rounded-t-lg`}>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5" />
                  <CardTitle className="text-lg">{statusType.value}</CardTitle>
                  <div className="flex-1" />
                  <span className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {filteredProjects.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[70vh] p-2">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhum projeto
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="font-medium">{project.client_name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {project.template || "Sem modelo"}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-500">
                            {formatDate(project.created_at)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleViewEdit(project.id, 'view')}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleViewEdit(project.id, 'edit')}
                            >
                              <PenSquare className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-1">
                          {STATUS_TYPES.filter(s => s.value !== project.status).map(status => (
                            <Button 
                              key={status.value} 
                              variant="ghost" 
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => updateProjectStatus(project.id, status.value)}
                            >
                              <status.icon className="h-3 w-3 mr-1" />
                              {status.value.length > 10 ? `${status.value.substring(0, 10)}...` : status.value}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render the original list view
  const renderListView = () => {
    return (
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
    );
  };

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projetos</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md p-1 bg-muted/20">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="text-sm"
            >
              Lista
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="text-sm"
            >
              Kanban
            </Button>
          </div>
          <Button onClick={handleNewProject} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Novo site
          </Button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        renderKanbanBoard()
      ) : (
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
                    {STATUS_TYPES.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {renderListView()}
        </>
      )}
    </div>
  );
}
