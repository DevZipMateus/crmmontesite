
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/server/project-actions";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project"; // Ensure we're using the correct Project type
import { ProjectHeader } from "@/components/projeto/detail/ProjectHeader";
import { ProjectInformation } from "@/components/projeto/detail/ProjectInformation";
import { PersonalizationData } from "@/components/projeto/detail/PersonalizationData";
import { PersonalizationFiles } from "@/components/projeto/detail/PersonalizationFiles";
import { CustomizationsCard } from "@/components/projeto/detail/CustomizationsCard";
import { ProjectTabs } from "@/components/projeto/detail/ProjectTabs";

export default function ProjetoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Function to get a public URL for a file in storage
  const getFileUrl = async (filePath: string) => {
    if (!filePath) return null;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('site_personalizacoes')
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiration
      
      if (error) {
        console.error("Erro ao gerar URL para arquivo:", error);
        return null;
      }
      
      return data.signedUrl;
    } catch (err) {
      console.error("Erro ao processar arquivo:", err);
      return null;
    }
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
      />
      
      <div className="grid gap-6">
        {project && <ProjectInformation project={project as Project} />}

        {/* Personalização Components */}
        {personalization && (
          <>
            <PersonalizationData personalization={personalization} />
            <PersonalizationFiles 
              personalization={personalization} 
              getFileUrl={getFileUrl} 
            />
          </>
        )}

        <CustomizationsCard 
          customizations={customizations || []} 
          isLoading={customizationsLoading} 
        />
      </div>

      <ProjectTabs project={project as Project} />
    </PageLayout>
  );
}
