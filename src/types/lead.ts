
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

export interface LeadFilters {
  empresa?: string;
  vendedor?: string;
  situacao?: string;
  diasSemResposta?: number;
}
