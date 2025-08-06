
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
        .select(`
          *,
          projects:project_id(
            id,
            client_name,
            status,
            template
          )
        `)
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

      // Filtro por faixa de dias (feito no frontend)
      if (filters?.faixaDias) {
        filteredData = filteredData.filter(lead => {
          const contactDate = new Date(lead.data_ultimo_contato);
          const today = new Date();
          const daysDiff = Math.ceil((today.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (filters.faixaDias) {
            case '1-3':
              return daysDiff >= 1 && daysDiff <= 3 && !lead.situacao.toLowerCase().includes('site pronto');
            case '4-7':
              return daysDiff >= 4 && daysDiff <= 7 && !lead.situacao.toLowerCase().includes('site pronto');
            case '8-14':
              return daysDiff >= 8 && daysDiff <= 14 && !lead.situacao.toLowerCase().includes('site pronto');
            case '15-30':
              return daysDiff >= 15 && daysDiff <= 30 && !lead.situacao.toLowerCase().includes('site pronto');
            case '30+':
              return daysDiff > 30 && !lead.situacao.toLowerCase().includes('site pronto');
            case 'site-pronto':
              return lead.situacao.toLowerCase().includes('site pronto');
            default:
              return true;
          }
        });
      }

      // Filtro por observações (feito no frontend)
      if (filters?.comObservacao !== undefined) {
        filteredData = filteredData.filter(lead => {
          const hasObservacao = lead.observacoes && lead.observacoes.trim().length > 0;
          return filters.comObservacao ? hasObservacao : !hasObservacao;
        });
      }

      // Aplicar ordenação
      if (filters?.ordenacao) {
        filteredData.sort((a, b) => {
          const dateA = new Date(a.data_ultimo_contato);
          const dateB = new Date(b.data_ultimo_contato);
          const daysA = Math.ceil((new Date().getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
          const daysB = Math.ceil((new Date().getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (filters.ordenacao) {
            case 'asc':
              return dateA.getTime() - dateB.getTime();
            case 'desc':
              return dateB.getTime() - dateA.getTime();
            case 'dias_asc':
              // Para leads com "Site Pronto", considerar 0 dias
              const adjustedDaysA = a.situacao.toLowerCase().includes('site pronto') ? 0 : daysA;
              const adjustedDaysB = b.situacao.toLowerCase().includes('site pronto') ? 0 : daysB;
              return adjustedDaysA - adjustedDaysB;
            case 'dias_desc':
              const adjustedDaysA2 = a.situacao.toLowerCase().includes('site pronto') ? 0 : daysA;
              const adjustedDaysB2 = b.situacao.toLowerCase().includes('site pronto') ? 0 : daysB;
              return adjustedDaysB2 - adjustedDaysA2;
            default:
              return 0;
          }
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
      // Check for duplicate company names in the last minute
      const { data: existingLeads, error: checkError } = await supabase
        .from('leads')
        .select('id, empresa, created_at')
        .eq('empresa', leadData.empresa?.trim())
        .gte('created_at', new Date(Date.now() - 60000).toISOString());

      if (checkError) {
        console.warn("Aviso ao verificar leads existentes:", checkError);
      }

      if (existingLeads && existingLeads.length > 0) {
        throw new Error(`Um lead para a empresa "${leadData.empresa}" foi criado recentemente. Aguarde um momento antes de criar outro.`);
      }

      const { data, error } = await supabase
        .from('leads')
        .insert([{
          ...leadData,
          empresa: leadData.empresa?.trim(),
          nome_cliente: leadData.nome_cliente?.trim()
        }])
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
        description: error instanceof Error ? error.message : "Não foi possível criar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

// Hook para obter as situações padronizadas
export const useSituacoesPadronizadas = () => {
  return SITUACOES_PADRONIZADAS;
};
