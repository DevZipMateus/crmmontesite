
export interface Project {
  id: string;
  client_name: string;
  template: string;  
  status: string;    
  created_at: string;
  updated_at: string;
  responsible_name?: string;
  domain?: string;
  client_type?: string;
  blaster_link?: string;
  partner_link?: string;
  personalization_id?: string;
  provider_credentials?: string;
  hasPendingCustomizations?: boolean;
  
  // Campos para webhook/parceiros
  partner_hash?: string;
  partner_webhook_url?: string;
  cnpj?: string;
  telefone?: string;
  project_source?: string;
  
  // Novos campos para formulário de personalização
  modelo_escolhido?: string;
  observacoes_cliente?: string;
  email_complementar?: string;
  formulario_preenchido?: boolean;
  data_formulario?: string;
}
