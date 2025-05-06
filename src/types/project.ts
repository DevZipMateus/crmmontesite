
export interface Project {
  id: string;
  client_name: string;
  template: string;  
  status: string;    
  created_at: string;
  updated_at: string; // Added this property
  responsible_name?: string;
  domain?: string;
  client_type?: string;
  blaster_link?: string;
  partner_link?: string;
  personalization_id?: string;
  provider_credentials?: string; // Added this property
  hasPendingCustomizations?: boolean;
}
