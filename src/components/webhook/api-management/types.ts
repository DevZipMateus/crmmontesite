
export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive';
  lastTested: string;
}
