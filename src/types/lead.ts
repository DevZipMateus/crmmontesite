
export interface Lead {
  id: string;
  empresa: string;
  nome_cliente: string;
  email?: string;
  cnpj?: string;
  link_blaster?: string;
  data_ultimo_contato: string;
  link_chat?: string;
  vendedor?: string;
  situacao: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Novos campos para vinculação com projetos
  project_id?: string;
  link_confidence_score?: number;
  link_method?: string;
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
  faixaDias?: string;
  ordenacao?: 'asc' | 'desc' | 'dias_asc' | 'dias_desc' | 'cadastro_asc' | 'cadastro_desc';
  comObservacao?: boolean;
  dataInicio?: Date;
  dataFim?: Date;
}

// Situações padronizadas dos leads
export const SITUACOES_PADRONIZADAS = [
  'Novo cliente',
  'Em Contato',
  'Aguardando',
  'Aguardando Resposta',
  'Preenchendo Formulário',
  'Em Desenvolvimento',
  'Configurando Domínio',
  'Site Pronto',
  'Sem Resposta',
  'Cancelado'
] as const;

export type SituacaoLead = typeof SITUACOES_PADRONIZADAS[number];

// Interface para resultados de vinculação automática
export interface LeadProjectLink {
  lead_id: string;
  project_id: string;
  confidence_score: number;
  link_method: string;
}
