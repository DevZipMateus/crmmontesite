
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/server/project-actions";
import { CustomizationList } from "@/components/projeto/CustomizationList";
import { CustomizationForm } from "@/components/projeto/CustomizationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomizationTab } from "@/components/projeto/CustomizationTab";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";

export default function ProjetoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  const { data: customizations, isLoading: customizationsLoading } = useQuery({
    queryKey: ["customizations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_customizations')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleProjectDeleted = () => {
    navigate('/projetos');
  };

  if (projectLoading) {
    return (
      <PageLayout title="Carregando projeto...">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={`Projeto: ${project?.client_name}`}
      actions={
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nova Customização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Solicitação de Customização</DialogTitle>
              </DialogHeader>
              <CustomizationForm 
                projectId={id as string} 
                onSuccess={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/projeto/${id}/editar`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Editar
          </Button>
        </>
      }
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-500"
          onClick={() => navigate('/projetos')}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Lista de Projetos
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle>Informações do Projeto</CardTitle>
            <DeleteProjectDialog 
              projectId={id as string}
              projectName={project?.client_name || ""}
              onDelete={handleProjectDeleted}
              variant="button"
              size="sm"
            />
          </CardHeader>
          <CardContent className="p-6">
            {project && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p className="mt-1">{project.client_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">{project.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Template</p>
                  <p className="mt-1">{project.template || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Responsável</p>
                  <p className="mt-1">{project.responsible_name || '—'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Customizações Solicitadas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {customizationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <CustomizationList customizations={customizations || []} />
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="domain">Domínio</TabsTrigger>
          <TabsTrigger value="customization">Personalizações</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="gdocs">Google Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="customization" className="space-y-4">
          {project ? (
            <CustomizationTab projectId={project.id} projectStatus={project.status || ''} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
