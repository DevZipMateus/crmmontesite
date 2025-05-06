
export interface Project {
  id: string;
  client_name: string;
  template: string;  
  status: string;    
  created_at: string;
  responsible_name?: string;
  domain?: string;
  client_type?: string;
  blaster_link?: string; // Now only used for its original purpose, not for relationships
  partner_link?: string;
  personalization_id?: string; // New field for relationship with site_personalizacoes
  hasPendingCustomizations?: boolean;
}
