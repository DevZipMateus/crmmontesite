
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadProjectLink } from "@/types/lead";

export const useLeadProjectLinking = () => {
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const runAutoLinking = async () => {
    console.log("useLeadProjectLinking: Iniciando vinculação automática...");
    setIsLinking(true);
    
    try {
      console.log("useLeadProjectLinking: Chamando função RPC auto_link_leads_projects...");
      
      // Chamar a função de vinculação automática
      const { data: linkResults, error: rpcError } = await supabase
        .rpc('auto_link_leads_projects');

      if (rpcError) {
        console.error('useLeadProjectLinking: Erro na RPC auto_link_leads_projects:', rpcError);
        throw new Error(`Erro na função de vinculação: ${rpcError.message}`);
      }

      console.log("useLeadProjectLinking: Resultados da função RPC:", linkResults);

      if (!linkResults || linkResults.length === 0) {
        console.log("useLeadProjectLinking: Nenhuma vinculação encontrada");
        toast({
          title: "Vinculação concluída",
          description: "Não foram encontradas novas vinculações para fazer.",
        });
        return { linked: 0, results: [] };
      }

      console.log(`useLeadProjectLinking: ${linkResults.length} potenciais vinculações encontradas`);

      // Aplicar as vinculações encontradas
      let successCount = 0;
      const errors: string[] = [];
      
      for (const link of linkResults) {
        try {
          console.log(`useLeadProjectLinking: Aplicando vinculação - Lead: ${link.lead_id}, Project: ${link.project_id}, Método: ${link.link_method}, Confiança: ${link.confidence_score}%`);
          
          // Atualizar o lead com a vinculação
          const { error: leadError } = await supabase
            .from('leads')
            .update({
              project_id: link.project_id,
              link_confidence_score: link.confidence_score,
              link_method: link.link_method,
              updated_at: new Date().toISOString()
            })
            .eq('id', link.lead_id);

          if (leadError) {
            console.error('useLeadProjectLinking: Erro ao atualizar lead:', leadError);
            errors.push(`Erro no lead ${link.lead_id}: ${leadError.message}`);
            continue;
          }

          // Atualizar o projeto com a vinculação
          const { error: projectError } = await supabase
            .from('projects')
            .update({
              lead_id: link.lead_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', link.project_id);

          if (projectError) {
            console.error('useLeadProjectLinking: Erro ao atualizar projeto:', projectError);
            errors.push(`Erro no projeto ${link.project_id}: ${projectError.message}`);
            continue;
          }

          successCount++;
          console.log(`useLeadProjectLinking: Vinculação aplicada com sucesso - ${successCount}/${linkResults.length}`);
          
        } catch (error) {
          console.error('useLeadProjectLinking: Erro ao aplicar vinculação:', error);
          errors.push(`Erro ao aplicar vinculação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      // Mostrar resultado
      if (successCount > 0) {
        console.log(`useLeadProjectLinking: Vinculação concluída com sucesso. ${successCount} vinculações realizadas.`);
        toast({
          title: "Vinculação automática concluída",
          description: `${successCount} vinculações realizadas com sucesso.`,
        });
      }

      if (errors.length > 0) {
        console.error(`useLeadProjectLinking: ${errors.length} erros durante vinculação:`, errors);
        toast({
          title: "Vinculação parcialmente concluída",
          description: `${successCount} vinculações realizadas, mas ${errors.length} falharam.`,
          variant: "destructive",
        });
      }

      return { linked: successCount, results: linkResults };

    } catch (error) {
      console.error('useLeadProjectLinking: Erro geral na vinculação automática:', error);
      toast({
        title: "Erro na vinculação",
        description: error instanceof Error ? error.message : "Não foi possível executar a vinculação automática.",
        variant: "destructive",
      });
      return { linked: 0, results: [] };
    } finally {
      setIsLinking(false);
      console.log("useLeadProjectLinking: Processo de vinculação finalizado");
    }
  };

  const manualLink = async (leadId: string, projectId: string) => {
    console.log(`useLeadProjectLinking: Iniciando vinculação manual - Lead: ${leadId}, Project: ${projectId}`);
    
    try {
      // Atualizar o lead
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          project_id: projectId,
          link_confidence_score: 100,
          link_method: 'manual',
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (leadError) {
        console.error('useLeadProjectLinking: Erro ao atualizar lead na vinculação manual:', leadError);
        throw leadError;
      }

      // Atualizar o projeto
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          lead_id: leadId,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (projectError) {
        console.error('useLeadProjectLinking: Erro ao atualizar projeto na vinculação manual:', projectError);
        throw projectError;
      }

      console.log('useLeadProjectLinking: Vinculação manual realizada com sucesso');
      toast({
        title: "Vinculação manual realizada",
        description: "Lead e projeto foram vinculados com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('useLeadProjectLinking: Erro na vinculação manual:', error);
      toast({
        title: "Erro na vinculação",
        description: "Não foi possível vincular o lead ao projeto.",
        variant: "destructive",
      });
      return false;
    }
  };

  const unlinkLeadProject = async (leadId: string) => {
    console.log(`useLeadProjectLinking: Removendo vinculação do lead: ${leadId}`);
    
    try {
      // Remover vinculação do lead
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          project_id: null,
          link_confidence_score: 0,
          link_method: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (leadError) {
        console.error('useLeadProjectLinking: Erro ao remover vinculação do lead:', leadError);
        throw leadError;
      }

      // Buscar o projeto vinculado e remover a vinculação
      const { data: projects, error: projectFindError } = await supabase
        .from('projects')
        .select('id')
        .eq('lead_id', leadId);

      if (projectFindError) {
        console.error('useLeadProjectLinking: Erro ao buscar projetos vinculados:', projectFindError);
        throw projectFindError;
      }

      if (projects && projects.length > 0) {
        const { error: projectError } = await supabase
          .from('projects')
          .update({
            lead_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('lead_id', leadId);

        if (projectError) {
          console.error('useLeadProjectLinking: Erro ao remover vinculação do projeto:', projectError);
          throw projectError;
        }
      }

      console.log('useLeadProjectLinking: Vinculação removida com sucesso');
      toast({
        title: "Vinculação removida",
        description: "A vinculação entre lead e projeto foi removida.",
      });

      return true;
    } catch (error) {
      console.error('useLeadProjectLinking: Erro ao remover vinculação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a vinculação.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    runAutoLinking,
    manualLink,
    unlinkLeadProject,
    isLinking
  };
};
