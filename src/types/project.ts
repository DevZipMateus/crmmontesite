
export interface Project {
  id: string;
  client_name: string;
  template?: string;
  status?: string;
  created_at: string;
  responsible_name?: string;
  domain?: string;
  client_type?: string;
  blaster_link?: string;
  partner_link?: string;
  hasPendingCustomizations?: boolean;
}
