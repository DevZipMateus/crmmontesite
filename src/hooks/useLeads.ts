
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadFilters, SITUACOES_PADRONIZADAS } from "@/types/lead";
import { useToast } from "@/hooks/use-toast";

export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .order('data_ultimo_contato', { ascending: false });

      if (filters?.empresa) {
        query = query.ilike('empresa', `%${filters.empresa}%`);
      }

      if (filters?.vendedor) {
        query = query.eq('vendedor', filters.vendedor);
      }

      if (filters?.situacao) {
        query = query.eq('situacao', filters.situacao);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leads:', error);
        throw error;
      }

      let filteredData = data || [];

      // Filtro por dias sem resposta (feito no frontend devido à complexidade da função SQL)
      if (filters?.diasSemResposta !== undefined) {
        filteredData = filteredData.filter(lead => {
          const days = Math.ceil((Date.now() - new Date(lead.data_ultimo_contato).getTime()) / (1000 * 60 * 60 * 24));
          if (filters.diasSemResposta === 30) {
            return days > 14;
          }
          return days <= filters.diasSemResposta;
        });
      }

      return filteredData as Lead[];
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead atualizado",
        description: "As informações do lead foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead criado",
        description: "O novo lead foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

// Hook para obter as situações padronizadas
export const useSituacoesPadronizadas = () => {
  return SITUACOES_PADRONIZADAS;
};
