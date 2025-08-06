-- Add client submission hash to projects table
ALTER TABLE public.projects 
ADD COLUMN client_submission_hash TEXT;

-- Generate unique hashes for existing projects
UPDATE public.projects 
SET client_submission_hash = encode(gen_random_bytes(16), 'hex')
WHERE client_submission_hash IS NULL;

-- Create table for client media submissions
CREATE TABLE public.client_media_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  message TEXT,
  media_urls JSONB NOT NULL DEFAULT '[]',
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_media_submissions
ALTER TABLE public.client_media_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for client_media_submissions
CREATE POLICY "Allow public insert on client_media_submissions" 
ON public.client_media_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view client_media_submissions" 
ON public.client_media_submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to update client_media_submissions" 
ON public.client_media_submissions 
FOR UPDATE 
USING (true);

-- Create storage bucket for client submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-submissions', 'client-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for client submissions
CREATE POLICY "Allow public upload to client-submissions bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'client-submissions');

CREATE POLICY "Allow authenticated users to view client-submissions" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-submissions');

-- Create function to auto-generate client submission hash for new projects
CREATE OR REPLACE FUNCTION public.generate_client_submission_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_submission_hash IS NULL THEN
    NEW.client_submission_hash = encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate hash for new projects
CREATE TRIGGER trigger_generate_client_submission_hash
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_client_submission_hash();

-- Add updated_at trigger for client_media_submissions
CREATE TRIGGER update_client_media_submissions_updated_at
  BEFORE UPDATE ON public.client_media_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();