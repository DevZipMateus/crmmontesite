
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
  // Removed partner_link as it doesn't exist in the database
  personalization_id?: string;
  provider_credentials?: string;
  hasPendingCustomizations?: boolean;
}
