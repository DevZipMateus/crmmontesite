
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CustomizationTab } from "@/components/projeto/CustomizationTab";
import { Project } from "@/types/project";
import { ProjectInformation } from "./ProjectInformation";
import { PersonalizationFiles } from "./PersonalizationFiles";
import { PersonalizationData } from "./PersonalizationData";
import { ClientSubmissionsCard } from "./ClientSubmissionsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/supabase/storage";
import { useProjectTabNotifications } from "@/hooks/useProjectTabNotifications";

interface ProjectTabsProps {
  project: Project | undefined;
}

export const ProjectTabs: React.FC<ProjectTabsProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState("info");

  // Query to fetch personalization data for uploads
  const { data: personalization } = useQuery({
    queryKey: ["personalization", project?.personalization_id, project?.partner_hash],
    queryFn: async () => {
      if (!project) return null;
      
      // First, try to get personalization using personalization_id
      if (project.personalization_id) {
        const { data, error } = await supabase
          .from('site_personalizacoes')
          .select('*')
          .eq('id', project.personalization_id)
          .single();
        
        if (!error && data) {
          return data;
        }
      }
      
      // For partner projects, try to find personalization by project data
      if (project.partner_hash && project.observacoes_cliente) {
        // Extract structured data from observacoes_cliente
        const observacoes = project.observacoes_cliente || "";
        const parts = observacoes.split(" | ");
        
        let servicos = "";
        let depoimentos = "";
        let planos = "";
        let descricao = parts[0] || "";
        
        parts.forEach(part => {
          if (part.startsWith("Serviços: ")) {
            servicos = part.replace("Serviços: ", "");
          } else if (part.startsWith("Depoimentos: ")) {
            depoimentos = part.replace("Depoimentos: ", "");
          } else if (part.startsWith("Planos: ")) {
            planos = part.replace("Planos: ", "");
          }
        });
        
        // Create a virtual personalization object
        const virtualPersonalization = {
          id: `virtual-${project.id}`,
          officenome: project.client_name,
          responsavelnome: project.client_name,
          telefone: project.telefone || "Não informado",
          email: project.email_complementar || "Não informado",
          endereco: "",
          redessociais: "",
          fonte: "",
          paletacores: "",
          descricao: descricao,
          slogan: "",
          possuiplanos: planos ? true : false,
          planos: planos,
          servicos: servicos,
          depoimentos: depoimentos,
          botaowhatsapp: true,
          possuimapa: false,
          linkmapa: "",
          modelo: project.modelo_escolhido || project.template || "",
          logo_url: null,
          depoimento_urls: null,
          midia_urls: null,
          created_at: project.created_at,
          updated_at: project.updated_at,
          status: 'partner_project'
        };
        
        return virtualPersonalization;
      }
      
      return null;
    },
    enabled: !!project,
  });

  // Function to get a public URL for a file in storage
  const getFileUrl = async (filePath: string | { url: string; caption?: string }) => {
    return getSignedUrl(filePath);
  };

  const personalizationId =
    personalization && !String(personalization.id).startsWith("virtual-")
      ? (personalization.id as string)
      : null;

  const { submissionsCount, formChangesCount, markSeen } =
    useProjectTabNotifications({
      projectId: project?.id,
      personalizationId,
    });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "submissions") markSeen("submissions");
    if (value === "form" || value === "info") markSeen(value as any);
  };

  // Mark the initially open tab as seen
  useEffect(() => {
    if (project?.id) markSeen("info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const NotifBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <Badge
        variant="destructive"
        className="ml-2 h-5 min-w-5 px-1.5 text-xs"
      >
        {count}
      </Badge>
    ) : null;

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="info">
          Informações
          <NotifBadge count={formChangesCount} />
        </TabsTrigger>
        <TabsTrigger value="form">
          Formulário do Cliente
          <NotifBadge count={formChangesCount} />
        </TabsTrigger>
        <TabsTrigger value="customization">Personalizações</TabsTrigger>
        <TabsTrigger value="upload">Uploads</TabsTrigger>
        <TabsTrigger value="submissions">Envios do Cliente</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4">
        {project && <ProjectInformation project={project} />}
      </TabsContent>

      <TabsContent value="form" className="space-y-4">
        {personalization ? (
          <PersonalizationData personalization={personalization} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Nenhum formulário preenchido encontrado para este projeto.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="customization" className="space-y-4">
        {project ? (
          <CustomizationTab projectId={project.id} projectStatus={project.status || ''} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="space-y-4">
        {personalization ? (
          <PersonalizationFiles 
            personalization={personalization} 
            getFileUrl={getFileUrl} 
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Nenhum arquivo encontrado para este projeto.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="submissions" className="space-y-4">
        {project && (
          <ClientSubmissionsCard 
            projectId={project.id} 
            clientSubmissionHash={project.client_submission_hash}
            projectName={project.client_name}
          />
        )}
      </TabsContent>

    </Tabs>
  );
};
