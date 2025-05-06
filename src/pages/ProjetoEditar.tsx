
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

export default function ProjetoEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [personalizationId, setPersonalizationId] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  // Check if there's a personalization associated with this project
  useEffect(() => {
    if (id) {
      getPersonalizationId(id)
        .then(personId => {
          setPersonalizationId(personId);
        })
        .catch(err => {
          console.error("Error getting personalization ID:", err);
        });
    }
  }, [id]);

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
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
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
                  <p className="text-sm text-green-800">
                    Personalização encontrada para este projeto (ID: {personalizationId})
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate(`/personalize-site/${project?.template || ""}`)}
                  >
                    Ver Personalização
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
}
