export interface DeliveryTerm {
  id: string;
  project_id: string;
  nota_atendimento: number;
  comentarios?: string;
  nome_completo: string;
  cpf: string;
  data_aceite: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithTermStatus {
  id: string;
  client_name: string;
  domain?: string;
  delivery_term_hash?: string;
  delivery_term?: DeliveryTerm | null;
}
