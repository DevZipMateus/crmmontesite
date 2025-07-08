
-- Adicionar novos campos à tabela sales_landing_pages
ALTER TABLE public.sales_landing_pages 
ADD COLUMN cargo TEXT,
ADD COLUMN formacao_certificacoes TEXT;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.sales_landing_pages.cargo IS 'Cargo/posição atual do vendedor';
COMMENT ON COLUMN public.sales_landing_pages.formacao_certificacoes IS 'Formações acadêmicas e certificações profissionais';
