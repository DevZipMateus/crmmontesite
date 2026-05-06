import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/server/project";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { ProjectHeader } from "@/components/projeto/detail/ProjectHeader";
import { ProjectDetailSidebar } from "@/components/projeto/detail/ProjectDetailSidebar";
import { ProjectTabs } from "@/components/projeto/detail/ProjectTabs";
import { getSignedUrl } from "@/lib/supabase/storage";
import { exportProjectToPDF } from "@/services/projectExportService";
import { useToast } from "@/hooks/use-toast";
import { useModelDetails } from "@/utils/modelUtils";
import { TopBar } from "@/components/layout/TopBar";

export default function ProjetoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) navigate('/projetos');
  }, [id, navigate]);

  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => {
      if (!id) throw new Error("ID do projeto e obrigatorio");
      return getProjectById(id);
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error?.message?.includes("nao encontrado") || error?.message?.includes("404")) return false;
      return failureCount < 2;
    }
  });

  const { modelName } = useModelDetails(project?.template);

  useEffect(() => {
    if (projectError) {
      setTimeout(() => navigate('/projetos'), 3000);
    }
  }, [projectError, navigate]);

  const { data: customizations, isLoading: customizationsLoading } = useQuery({
    queryKey: ["customizations", id],
    queryFn: async () => {
      if (!id) return [];
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

  const handleProjectDeleted = () => navigate('/projetos');

  const handleExportPDF = async () => {
    if (!project) return;
    try {
      toast({ title: "Gerando PDF...", description: "Aguarde..." });
      await exportProjectToPDF(project as Project, null, customizations);
      toast({ title: "PDF exportado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao exportar PDF", variant: "destructive" });
    }
  };

  if (projectLoading) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center items-center py-20 text-center">
          <p className="text-destructive text-lg mb-4">Projeto nao encontrado</p>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        breadcrumbs={[
          { label: "Inicio", href: "/home" },
          { label: "Projetos", href: "/projetos" },
          { label: project.client_name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Actions moved into ProjectHeader */}
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          <ProjectHeader
            projectId={id as string}
            projectName={project.client_name}
            projectStatus={project.status}
            projectType={project.client_type}
            projectModel={modelName || project.template}
            createdAt={project.created_at}
            responsibleName={project.responsible_name}
            leadId={project.lead_id}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            handleProjectDeleted={handleProjectDeleted}
            personalizationId={project.personalization_id}
            onExportPDF={handleExportPDF}
          />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
            {/* Main content */}
            <div>
              <ProjectTabs project={project as Project} />
            </div>

            {/* Sidebar */}
            <div className="order-first lg:order-last">
              <ProjectDetailSidebar project={project as Project} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
