
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/server/project";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { ProjectHeader } from "@/components/projeto/detail/ProjectHeader";
import { PersonalizationData } from "@/components/projeto/detail/PersonalizationData";
import { PersonalizationFiles } from "@/components/projeto/detail/PersonalizationFiles";
import { CustomizationsCard } from "@/components/projeto/detail/CustomizationsCard";
import { ProjectTabs } from "@/components/projeto/detail/ProjectTabs";
import { getSignedUrl } from "@/lib/supabase/storage";

export default function ProjetoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query to fetch the project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: !!id,
  });

  // Query to fetch personalization data
  const { data: personalization, isLoading: personalizationLoading } = useQuery({
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
          console.log("Personalization found using personalization_id:", data);
          return data;
        }
      }
      
      // For partner projects, try to find personalization by project data
      if (project.partner_hash && project.observacoes_cliente) {
        console.log("Creating virtual personalization for partner project");
        
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
      
      // Backward compatibility: try using blaster_link if personalization_id is not available
      if (project.blaster_link && project.blaster_link.startsWith('personalization:')) {
        const personalizationId = project.blaster_link.replace('personalization:', '');
        
        const { data, error } = await supabase
          .from('site_personalizacoes')
          .select('*')
          .eq('id', personalizationId)
          .single();
        
        if (error) {
          console.error("Erro ao buscar personalização via blaster_link:", error);
          return null;
        }
        
        console.log("Personalization found using blaster_link:", data);
        return data;
      }
      
      console.log("No personalization found for project");
      return null;
    },
    enabled: !!project,
  });

  // Query to fetch customizations
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

  // Function to get a public URL for a file in storage
  const getFileUrl = async (filePath: string | { url: string; caption?: string }) => {
    return getSignedUrl(filePath);
  };

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
    >
      <ProjectHeader 
        projectId={id as string}
        projectName={project?.client_name || ""}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleProjectDeleted={handleProjectDeleted}
        personalizationId={project?.personalization_id}
      />
      
      {/* Project Tabs for detailed information */}
      <ProjectTabs project={project as Project} />

      {/* Personalization Components */}
      {personalization && (
        <div className="mt-6 space-y-6">
          <PersonalizationData personalization={personalization} />
          <PersonalizationFiles 
            personalization={personalization} 
            getFileUrl={getFileUrl} 
          />
        </div>
      )}

      {/* Customizations Card */}
      <div className="mt-6">
        <CustomizationsCard 
          customizations={customizations || []} 
          isLoading={customizationsLoading} 
        />
      </div>
    </PageLayout>
  );
}
