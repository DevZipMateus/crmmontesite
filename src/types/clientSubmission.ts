export interface ClientMediaSubmission {
  id: string;
  project_id: string;
  client_name: string;
  client_email?: string;
  message?: string;
  media_urls: Array<{
    url: string;
    caption?: string;
  }>;
  submission_date: string;
  status: 'pending' | 'viewed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ClientSubmissionFormData {
  client_name: string;
  client_email?: string;
  message?: string;
  images: File[];
}