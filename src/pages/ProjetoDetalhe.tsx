
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Plus, ExternalLink } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("info");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  const { data: personalization, isLoading: personalizationLoading } = useQuery({
    queryKey: ["personalization", project?.blaster_link],
    queryFn: async () => {
      if (!project?.blaster_link || !project.blaster_link.startsWith('personalization:')) {
        return null;
      }
      
      const personalizationId = project.blaster_link.replace('personalization:', '');
      
      const { data, error } = await supabase
        .from('site_personalizacoes')
        .select('*')
        .eq('id', personalizationId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar personalização:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!project?.blaster_link && project.blaster_link.startsWith('personalization:'),
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

        {/* Personalização Card - Show only if there's personalization data */}
        {personalization && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle>Dados da Personalização</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Informações Básicas</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Nome da Empresa:</span> {personalization.officenome}</p>
                      <p><span className="font-medium">Responsável:</span> {personalization.responsavelnome}</p>
                      <p><span className="font-medium">Telefone:</span> {personalization.telefone}</p>
                      <p><span className="font-medium">Email:</span> {personalization.email}</p>
                      <p><span className="font-medium">Endereço:</span> {personalization.endereco}</p>
                    </div>
                  </div>
                  
                  {personalization.redessociais && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Redes Sociais</h3>
                      <p className="mt-2 whitespace-pre-line">{personalization.redessociais}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Identidade Visual</h3>
                    <div className="mt-2 space-y-2">
                      {personalization.logo_url && (
                        <p><span className="font-medium">Logo:</span> <a href="#" className="text-blue-600 hover:underline">Ver logo</a></p>
                      )}
                      {personalization.fonte && (
                        <p><span className="font-medium">Fonte:</span> {personalization.fonte}</p>
                      )}
                      {personalization.paletacores && (
                        <p><span className="font-medium">Paleta de cores:</span> {personalization.paletacores}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                    <p className="mt-2">{personalization.descricao}</p>
                  </div>
                  
                  {personalization.slogan && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Slogan</h3>
                      <p className="mt-2">{personalization.slogan}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Serviços</h3>
                <p className="whitespace-pre-line">{personalization.servicos}</p>
              </div>
              
              {personalization.possuiplanos && personalization.planos && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Planos</h3>
                  <p className="whitespace-pre-line">{personalization.planos}</p>
                </div>
              )}
              
              {personalization.depoimentos && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Depoimentos</h3>
                  <p className="whitespace-pre-line">{personalization.depoimentos}</p>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Configurações Adicionais</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Botão WhatsApp:</span> {personalization.botaowhatsapp ? 'Sim' : 'Não'}</p>
                  <p><span className="font-medium">Possui mapa:</span> {personalization.possuimapa ? 'Sim' : 'Não'}</p>
                  {personalization.possuimapa && personalization.linkmapa && (
                    <p>
                      <span className="font-medium">Link do mapa:</span>{' '}
                      <a 
                        href={personalization.linkmapa} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Ver mapa <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
