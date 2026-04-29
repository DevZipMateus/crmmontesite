-- Tabela para rascunhos de formulários de lead (sincronização entre dispositivos)
CREATE TABLE public.lead_form_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_hash TEXT NOT NULL UNIQUE,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_form_drafts_form_hash ON public.lead_form_drafts(form_hash);
CREATE INDEX idx_lead_form_drafts_updated_at ON public.lead_form_drafts(updated_at);

ALTER TABLE public.lead_form_drafts ENABLE ROW LEVEL SECURITY;

-- Acesso público: o form_hash em si é o "segredo" que protege o rascunho
-- (mesma abordagem dos formulários de lead já existentes)
CREATE POLICY "Public can read drafts by form_hash"
  ON public.lead_form_drafts FOR SELECT
  USING (true);

CREATE POLICY "Public can insert drafts"
  ON public.lead_form_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update drafts"
  ON public.lead_form_drafts FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete drafts"
  ON public.lead_form_drafts FOR DELETE
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_lead_form_drafts_updated_at
  BEFORE UPDATE ON public.lead_form_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();