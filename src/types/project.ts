
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
  isArchived?: boolean;
  manually_archived?: boolean;
  assigned_programmer?: string;
  
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
  
  // Campos para controle de prazo de customização
  site_ready_date?: string;
  customization_deadline?: string;
  requires_paid_customization?: boolean;
  
  // Campo para JOIN com personalização
  site_personalizacoes?: {
    email?: string;
  };
  
  // Novo campo para vinculação com leads
  lead_id?: string;
  
  // Campo para formulário de envio de imagens do cliente
  client_submission_hash?: string;
  
  // Campo para marcar projeto como inadimplente
  is_inadimplente?: boolean;
}
