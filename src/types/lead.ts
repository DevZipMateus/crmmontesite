
export interface Lead {
  id: string;
  empresa: string;
  nome_cliente: string;
  link_blaster?: string;
  data_ultimo_contato: string;
  link_chat?: string;
  vendedor?: string;
  situacao: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  nota: string;
  created_at: string;
  created_by: string;
}

export interface LeadFilters {
  empresa?: string;
  vendedor?: string;
  situacao?: string;
  diasSemResposta?: number;
}

// Situações padronizadas dos leads
export const SITUACOES_PADRONIZADAS = [
  'Em Contato',
  'Aguardando Resposta',
  'Preenchendo Formulário',
  'Em Desenvolvimento',
  'Configurando Domínio',
  'Site Pronto',
  'Sem Resposta',
  'Cancelado'
] as const;

export type SituacaoLead = typeof SITUACOES_PADRONIZADAS[number];
