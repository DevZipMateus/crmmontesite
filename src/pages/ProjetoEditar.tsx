
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectFormEdit } from "@/components/projeto/ProjectFormEdit";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById } from "@/server/project";
import { Project } from "@/types/project";
import { getPersonalizationId } from "@/lib/supabase/projectStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function ProjetoEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [personalizationId, setPersonalizationId] = useState<string | null>(null);
  const [personalizationData, setPersonalizationData] = useState<any>(null);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  // Check if there's an error loading the project
  useEffect(() => {
    if (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Erro ao carregar projeto",
        description: "Não foi possível carregar os dados do projeto.",
        variant: "destructive",
      });
    }
  }, [error]);

  // Check if there's a personalization associated with this project
  useEffect(() => {
    if (project?.personalization_id) {
      setPersonalizationId(project.personalization_id);
      fetchPersonalizationData(project.personalization_id);
    } else if (id) {
      // Backward compatibility check
      getPersonalizationId(id)
        .then(personId => {
          if (personId) {
            setPersonalizationId(personId);
            fetchPersonalizationData(personId);
          }
        })
        .catch(err => {
          console.error("Error getting personalization ID:", err);
        });
    }
  }, [id, project]);

  const fetchPersonalizationData = async (personId: string) => {
    try {
      const { data, error } = await supabase
        .from('site_personalizacoes')
        .select('*')
        .eq('id', personId)
        .single();

      if (error) {
        console.error("Erro ao buscar dados de personalização:", error);
        toast({
          title: "Erro ao carregar personalização",
          description: "Não foi possível carregar os dados da personalização.",
          variant: "destructive",
        });
      } else {
        setPersonalizationData(data);
        console.log("Dados da personalização carregados:", data);
      }
    } catch (err) {
      console.error("Erro ao buscar personalização:", err);
    }
  };

  const handleViewPersonalization = () => {
    if (!personalizationId) return;
    
    navigate(`/personalizacao/${personalizationId}`);
  };

  if (isLoading) {
    return (
      <PageLayout title="Editar Projeto">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </PageLayout>
    );
  }

  if (!project && !isLoading) {
    return (
      <PageLayout title="Editar Projeto">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-md">
          <h3 className="text-lg font-medium">Projeto não encontrado</h3>
          <p className="mt-2">Não foi possível encontrar o projeto solicitado.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/projetos')}
          >
            Voltar para Projetos
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Editar Projeto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-500"
          onClick={() => navigate(`/projeto/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Detalhes do Projeto
        </Button>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            {project && (
              <ProjectFormEdit 
                initialValues={project as Project}
                submitButtonText="Atualizar Projeto"
                mode="edit"
              />
            )}
          </CardContent>
        </Card>

        {personalizationId && (
          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                {personalizationData ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-800">
                      Personalização encontrada para este projeto
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Empresa:</strong> {personalizationData.officenome}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Responsável:</strong> {personalizationData.responsavelnome}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Email:</strong> {personalizationData.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-green-800">
                    Personalização encontrada para este projeto (ID: {personalizationId})
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={handleViewPersonalization}
                >
                  Ver Personalização Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
