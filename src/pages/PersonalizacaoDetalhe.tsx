
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PersonalizationData } from "@/components/projeto/detail/PersonalizationData";
import { PersonalizationFiles } from "@/components/projeto/detail/PersonalizationFiles";

export default function PersonalizacaoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch personalization data
  const { data: personalization, isLoading } = useQuery({
    queryKey: ["personalizacao", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('site_personalizacoes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar personalização:", error);
        return null;
      }
      
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

  // Find the associated project
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project-by-personalization", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('id,client_name')
        .eq('personalization_id', id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar projeto relacionado:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!id,
  });

  const handleBackButton = () => {
    if (project?.id) {
      navigate(`/projeto/${project.id}`);
    } else {
      navigate('/projetos');
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Carregando dados da personalização...">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </PageLayout>
    );
  }

  if (!personalization) {
    return (
      <PageLayout title="Personalização não encontrada">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-gray-500"
            onClick={() => navigate('/projetos')}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Lista de Projetos
          </Button>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Dados de Personalização</h2>
          </div>
          <p className="text-gray-500">Nenhuma informação de personalização encontrada com este ID.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={`Personalização: ${personalization.officenome}`}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-500"
          onClick={handleBackButton}
        >
          <ArrowLeft className="h-4 w-4" /> 
          {project ? `Voltar para Projeto: ${project.client_name}` : "Voltar para Lista de Projetos"}
        </Button>
      </div>
      
      <div className="grid gap-6">
        {/* Dados de Personalização */}
        <PersonalizationData personalization={personalization} />

        {/* Arquivos de Personalização */}
        <PersonalizationFiles 
          personalization={personalization} 
          getFileUrl={getFileUrl} 
        />
      </div>
    </PageLayout>
  );
}
