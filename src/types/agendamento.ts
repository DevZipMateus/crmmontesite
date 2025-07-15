
export interface LeadAgendamento {
  id: string;
  lead_id: string;
  titulo: string;
  descricao?: string;
  data_agendamento: string;
  created_at: string;
  completed_at?: string;
  status: 'Pendente' | 'Concluído' | 'Cancelado' | 'Reagendado';
  notification_sent?: boolean;
  original_time?: string;
  postponed_count?: number;
  created_by?: string;
}

export interface CreateAgendamentoData {
  lead_id: string;
  titulo: string;
  descricao?: string;
  data_agendamento: string;
}

export interface ExtendTimeData {
  agendamentoId: string;
  minutesToAdd: number;
}
