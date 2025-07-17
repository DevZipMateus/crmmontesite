
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/server/project";
import { useState, useEffect } from "react";
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

  console.log("ProjetoDetalhe: Componente renderizado com ID:", id);

  // Verificar se ID existe
  useEffect(() => {
    if (!id) {
      console.error("ProjetoDetalhe: ID não encontrado na URL");
      navigate('/projetos');
    }
  }, [id, navigate]);

  // Query to fetch the project data
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => {
      if (!id) {
        throw new Error("ID do projeto é obrigatório");
      }
      return getProjectById(id);
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      // Não tentar novamente se for erro 404 ou projeto não encontrado
      if (error?.message?.includes("não encontrado") || error?.message?.includes("404")) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Se houver erro, navegar de volta para projetos
  useEffect(() => {
    if (projectError) {
      console.error("ProjetoDetalhe: Erro ao carregar projeto, redirecionando...", projectError);
      setTimeout(() => {
        navigate('/projetos');
      }, 3000); // Dar tempo para o usuário ver o erro
    }
  }, [projectError, navigate]);

  // Query to fetch personalization data
  const { data: personalization, isLoading: personalizationLoading } = useQuery({
    queryKey: ["personalization", project?.personalization_id, project?.partner_hash],
    queryFn: async () => {
      if (!project) return null;
      
      console.log("ProjetoDetalhe: Buscando personalização para projeto:", project.client_name);
      
      // First, try to get personalization using personalization_id
      if (project.personalization_id) {
        console.log("ProjetoDetalhe: Tentando buscar por personalization_id:", project.personalization_id);
        
        const { data, error } = await supabase
          .from('site_personalizacoes')
          .select('*')
          .eq('id', project.personalization_id)
          .maybeSingle();
        
        if (!error && data) {
          console.log("ProjetoDetalhe: Personalização encontrada via personalization_id:", data);
          return data;
        } else if (error) {
          console.error("ProjetoDetalhe: Erro ao buscar personalização por ID:", error);
        }
      }
      
      // For partner projects, try to find personalization by project data
      if (project.partner_hash && project.observacoes_cliente) {
        console.log("ProjetoDetalhe: Criando personalização virtual para projeto de parceiro");
        
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
        console.log("ProjetoDetalhe: Tentando buscar por blaster_link");
        
        const personalizationId = project.blaster_link.replace('personalization:', '');
        
        const { data, error } = await supabase
          .from('site_personalizacoes')
          .select('*')
          .eq('id', personalizationId)
          .maybeSingle();
        
        if (error) {
          console.error("ProjetoDetalhe: Erro ao buscar personalização via blaster_link:", error);
          return null;
        }
        
        console.log("ProjetoDetalhe: Personalização encontrada via blaster_link:", data);
        return data;
      }
      
      console.log("ProjetoDetalhe: Nenhuma personalização encontrada para o projeto");
      return null;
    },
    enabled: !!project,
  });

  // Query to fetch customizations
  const { data: customizations, isLoading: customizationsLoading } = useQuery({
    queryKey: ["customizations", id],
    queryFn: async () => {
      if (!id) return [];
      
      console.log("ProjetoDetalhe: Buscando customizações para projeto:", id);
      
      const { data, error } = await supabase
        .from('project_customizations')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("ProjetoDetalhe: Erro ao buscar customizações:", error);
        throw error;
      }
      
      console.log("ProjetoDetalhe: Customizações encontradas:", data?.length || 0);
      return data;
    },
    enabled: !!id,
  });

  // Function to get a public URL for a file in storage
  const getFileUrl = async (filePath: string | { url: string; caption?: string }) => {
    return getSignedUrl(filePath);
  };

  const handleProjectDeleted = () => {
    console.log("ProjetoDetalhe: Projeto deletado, redirecionando para /projetos");
    navigate('/projetos');
  };

  // Loading state
  if (projectLoading) {
    console.log("ProjetoDetalhe: Carregando projeto...");
    return (
      <PageLayout title="Carregando projeto...">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (projectError || !project) {
    console.log("ProjetoDetalhe: Estado de erro ou projeto não encontrado");
    return (
      <PageLayout title="Erro ao carregar projeto">
        <div className="flex flex-col justify-center items-center py-20 text-center">
          <div className="text-destructive text-lg mb-4">
            ⚠️ Projeto não encontrado
          </div>
          <p className="text-muted-foreground mb-4">
            O projeto que você está tentando acessar não existe ou foi removido.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecionando em alguns segundos...
          </p>
        </div>
      </PageLayout>
    );
  }

  console.log("ProjetoDetalhe: Renderizando projeto:", project.client_name);

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
