
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadNote } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";

export const useLeadNotes = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar anotações do lead:', error);
        throw error;
      }

      return data as LeadNote[];
    },
    enabled: !!leadId,
  });
};

export const useCreateLeadNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ leadId, nota, created_by = 'Sistema' }: { 
      leadId: string; 
      nota: string; 
      created_by?: string; 
    }) => {
      const { data, error } = await supabase
        .from('lead_notes')
        .insert([{ 
          lead_id: leadId, 
          nota, 
          created_by 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', data.lead_id] });
      toast({
        title: "Anotação adicionada",
        description: "A anotação foi adicionada com sucesso ao lead.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar anotação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a anotação. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
