
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadAgendamento, CreateAgendamentoData, ExtendTimeData } from "@/types/agendamento";
import { useToast } from "@/hooks/use-toast";

export const useLeadAgendamentos = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-agendamentos', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_agendamentos')
        .select('*')
        .eq('lead_id', leadId)
        .order('data_agendamento', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        throw error;
      }

      return data as LeadAgendamento[];
    },
  });
};

export const useCreateAgendamento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (agendamentoData: CreateAgendamentoData) => {
      const { data, error } = await supabase
        .from('lead_agendamentos')
        .insert([{
          ...agendamentoData,
          original_time: agendamentoData.data_agendamento
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-agendamentos', data.lead_id] });
      toast({
        title: "Agendamento criado",
        description: "O contato foi agendado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAgendamento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeadAgendamento> }) => {
      const { data, error } = await supabase
        .from('lead_agendamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-agendamentos', data.lead_id] });
      toast({
        title: "Agendamento atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
    },
  });
};

export const useExtendAgendamento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ agendamentoId, minutesToAdd }: ExtendTimeData) => {
      // Primeiro buscar o agendamento atual
      const { data: currentAgendamento, error: fetchError } = await supabase
        .from('lead_agendamentos')
        .select('*')
        .eq('id', agendamentoId)
        .single();

      if (fetchError) throw fetchError;

      // Calcular nova data/hora
      const currentTime = new Date(currentAgendamento.data_agendamento);
      const newTime = new Date(currentTime.getTime() + (minutesToAdd * 60000));

      // Atualizar com novo horário
      const { data, error } = await supabase
        .from('lead_agendamentos')
        .update({
          data_agendamento: newTime.toISOString(),
          postponed_count: (currentAgendamento.postponed_count || 0) + 1,
          status: 'Reagendado'
        })
        .eq('id', agendamentoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-agendamentos', data.lead_id] });
      toast({
        title: "Horário estendido",
        description: "O agendamento foi reagendado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao estender agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reagendar o contato.",
        variant: "destructive",
      });
    },
  });
};
