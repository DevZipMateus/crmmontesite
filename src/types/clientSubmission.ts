export interface ClientMediaSubmission {
  id: string;
  project_id: string;
  client_name: string;
  client_email?: string;
  message?: string;
  media_urls: Array<{
    url: string;
    name: string;
    description?: string;
    price?: number;
    caption?: string; // mantido para compatibilidade
    category?: string;
  }>;
  submission_date: string;
  status: 'pending' | 'viewed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ClientSubmissionFormData {
  message?: string;
  images: Array<{
    file: File;
    name: string;
    description?: string;
    price?: number;
    category?: string;
  }>;
}

export interface ImageCategory {
  id: string;
  name: string;
  images: Array<{
    file: File;
    name: string;
    description?: string;
    price?: number;
  }>;
}