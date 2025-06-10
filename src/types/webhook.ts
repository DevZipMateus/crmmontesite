
export interface WebhookLog {
  id: string;
  project_id: string;
  webhook_type: 'received' | 'sent';
  payload: any;
  status: 'success' | 'failed' | 'pending';
  response?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  hash: string;
  name: string;
  webhook_url?: string;
  auth_token?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerDataPayload {
  nome: string;
  cnpj?: string;
  email?: string;
  telefone: string; // Agora obrigatório
  hash: string;
}

export interface StatusWebhookPayload {
  type: 'status_change';
  status: string;
  previous_status: string;
  nome: string;
  email?: string;
  telefone?: string;
  cnpj?: string;
  hash: string;
  data_status: string;
  domain?: string;
}

export interface DomainWebhookPayload {
  type: 'domain_change';
  domain: string;
  previous_domain?: string;
  nome: string;
  telefone?: string;
  cnpj?: string;
  hash: string;
  data_domain: string;
  status: string;
}

export type WebhookPayload = StatusWebhookPayload | DomainWebhookPayload | PartnerDataPayload;
