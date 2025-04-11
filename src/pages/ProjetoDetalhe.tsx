
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";

interface Project {
  id: string;
  client_name: string;
  template: string;
  status: string;
  created_at: string;
  responsible_name?: string;
}

export default function ProjetoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        try {
          const supabase = getSupabaseClient();
          
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            throw error;
          }

          setProject(data);
        } catch (error) {
          console.error('Error fetching project:', error);
          // Only show error toast if it's not the initialization error
          if (error instanceof Error && !error.message.includes('not initialized')) {
            toast({
              title: "Erro ao buscar projeto",
              description: "Não foi possível carregar os detalhes do projeto.",
              variant: "destructive",
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-10 max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center mb-4">Projeto não encontrado</p>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/projetos")}>Voltar para Projetos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Detalhes do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Nome do cliente</h3>
              <p className="text-lg">{project.client_name}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Modelo escolhido</h3>
              <p>{project.template}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'Finalizado'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'Em andamento'
                  ? 'bg-blue-100 text-blue-800'
                  : project.status === 'Pausado'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {project.status}
              </span>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Data de criação</h3>
              <p>{formatDate(project.created_at)}</p>
            </div>
            
            {project.responsible_name && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Responsável</h3>
                <p>{project.responsible_name}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => navigate("/projetos")}>
              Voltar
            </Button>
            <Button onClick={() => navigate(`/projeto/${id}/editar`)}>
              Editar Projeto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
