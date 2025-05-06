
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function ProjetoEditar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [personalizationId, setPersonalizationId] = useState<string | null>(null);
  const [blasterLink, setBlasterLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (project?.blaster_link) {
      setBlasterLink(project.blaster_link);
    }
  }, [project]);

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

  const handleSaveBlasterLink = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ blaster_link: blasterLink })
        .eq('id', id);
      
      if (error) throw error;
      toast({
        title: "Link atualizado",
        description: "O link do blaster foi atualizado com sucesso",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao atualizar link",
        description: "Ocorreu um erro ao atualizar o link do blaster",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to associate a personalization with this project
  const handleAssociatePersonalization = async () => {
    if (!id || !personalizationId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ blaster_link: `personalization:${personalizationId}` })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Personalização associada",
        description: "A personalização foi associada ao projeto com sucesso",
      });
      
      // Update the blaster link state to match
      setBlasterLink(`personalization:${personalizationId}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao associar personalização",
        description: "Ocorreu um erro ao associar a personalização ao projeto",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

          <Card>
            <CardHeader>
              <CardTitle>Link do Blaster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="blaster_link">Link do Blaster</Label>
                    <Input
                      id="blaster_link"
                      value={blasterLink}
                      onChange={(e) => setBlasterLink(e.target.value)}
                      placeholder="Ex: https://blaster.zipline.com.br/..."
                    />
                  </div>
                  <Button onClick={handleSaveBlasterLink} disabled={isSaving}>
                    Salvar Link
                  </Button>
                </div>
                
                {personalizationId && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-800">
                      Personalização encontrada para este projeto (ID: {personalizationId})
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={handleAssociatePersonalization}
                      disabled={isSaving}
                    >
                      Associar Personalização ao Projeto
                    </Button>
                  </div>
                )}
                
                {!personalizationId && blasterLink && !blasterLink.startsWith('personalization:') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <p className="text-sm text-amber-800">
                      Este projeto não está associado a uma personalização.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
