
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type LeadAgendamento = Tables<"lead_agendamentos">;

export type CreateAgendamentoData = {
  lead_id: string;
  titulo: string;
  descricao?: string;
  data_agendamento: string;
};

export interface ExtendTimeData {
  agendamentoId: string;
  minutesToAdd: number;
}
