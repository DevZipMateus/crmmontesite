
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";

export function useProjectArchiving() {
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  const archiveProject = async (projectId: string): Promise<boolean> => {
    try {
      setIsArchiving(true);
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('projects')
        .update({ manually_archived: true })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      toast({
        title: "Projeto arquivado",
        description: "O projeto foi arquivado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error archiving project:', error);
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar o projeto.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsArchiving(false);
    }
  };

  const unarchiveProject = async (projectId: string): Promise<boolean> => {
    try {
      setIsArchiving(true);
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('projects')
        .update({ manually_archived: false })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      toast({
        title: "Projeto desarquivado",
        description: "O projeto foi desarquivado com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error unarchiving project:', error);
      toast({
        title: "Erro ao desarquivar",
        description: "Não foi possível desarquivar o projeto.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsArchiving(false);
    }
  };

  return { archiveProject, unarchiveProject, isArchiving };
}
