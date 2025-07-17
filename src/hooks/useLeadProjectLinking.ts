
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LeadProjectLink } from "@/types/lead";

export const useLeadProjectLinking = () => {
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const runAutoLinking = async () => {
    setIsLinking(true);
    try {
      console.log("Iniciando vinculação automática de leads e projetos...");
      
      // Chamar a função de vinculação automática
      const { data: linkResults, error } = await supabase
        .rpc('auto_link_leads_projects');

      if (error) {
        console.error('Erro na vinculação automática:', error);
        throw error;
      }

      console.log("Resultados da vinculação:", linkResults);

      if (!linkResults || linkResults.length === 0) {
        toast({
          title: "Vinculação concluída",
          description: "Não foram encontradas novas vinculações para fazer.",
        });
        return { linked: 0, results: [] };
      }

      // Aplicar as vinculações encontradas
      let successCount = 0;
      for (const link of linkResults) {
        try {
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
            console.error('Erro ao atualizar lead:', leadError);
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
            console.error('Erro ao atualizar projeto:', projectError);
            continue;
          }

          successCount++;
        } catch (error) {
          console.error('Erro ao aplicar vinculação:', error);
        }
      }

      toast({
        title: "Vinculação automática concluída",
        description: `${successCount} vinculações realizadas com sucesso.`,
      });

      return { linked: successCount, results: linkResults };

    } catch (error) {
      console.error('Erro na vinculação automática:', error);
      toast({
        title: "Erro na vinculação",
        description: "Não foi possível executar a vinculação automática.",
        variant: "destructive",
      });
      return { linked: 0, results: [] };
    } finally {
      setIsLinking(false);
    }
  };

  const manualLink = async (leadId: string, projectId: string) => {
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

      if (leadError) throw leadError;

      // Atualizar o projeto
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          lead_id: leadId,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (projectError) throw projectError;

      toast({
        title: "Vinculação manual realizada",
        description: "Lead e projeto foram vinculados com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro na vinculação manual:', error);
      toast({
        title: "Erro na vinculação",
        description: "Não foi possível vincular o lead ao projeto.",
        variant: "destructive",
      });
      return false;
    }
  };

  const unlinkLeadProject = async (leadId: string) => {
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

      if (leadError) throw leadError;

      // Buscar o projeto vinculado e remover a vinculação
      const { data: projects, error: projectFindError } = await supabase
        .from('projects')
        .select('id')
        .eq('lead_id', leadId);

      if (projectFindError) throw projectFindError;

      if (projects && projects.length > 0) {
        const { error: projectError } = await supabase
          .from('projects')
          .update({
            lead_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('lead_id', leadId);

        if (projectError) throw projectError;
      }

      toast({
        title: "Vinculação removida",
        description: "A vinculação entre lead e projeto foi removida.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover vinculação:', error);
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
