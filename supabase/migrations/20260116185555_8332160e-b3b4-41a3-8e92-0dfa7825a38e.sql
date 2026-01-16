-- Create integration_settings table for storing integration configurations
CREATE TABLE public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL UNIQUE,
  webhook_url TEXT,
  api_key TEXT,
  active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial Make.com configuration
INSERT INTO integration_settings (integration_name, description)
VALUES ('make_delivery_term', 'Webhook para envio do termo de entrega ao Make.com');

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage integration_settings
CREATE POLICY "Allow authenticated users to view integration_settings"
ON public.integration_settings
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to update integration_settings"
ON public.integration_settings
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert integration_settings"
ON public.integration_settings
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_integration_settings_updated_at
BEFORE UPDATE ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();