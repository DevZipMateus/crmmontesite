-- Add new columns to site_personalizacoes for better data organization
ALTER TABLE public.site_personalizacoes
ADD COLUMN IF NOT EXISTS cnpj_cpf text,
ADD COLUMN IF NOT EXISTS visao_missao_valores text,
ADD COLUMN IF NOT EXISTS historia_empresa text,
ADD COLUMN IF NOT EXISTS mercado_atuacao text,
ADD COLUMN IF NOT EXISTS produtos text;

-- Add comment to explain the columns
COMMENT ON COLUMN public.site_personalizacoes.cnpj_cpf IS 'CNPJ ou CPF do cliente';
COMMENT ON COLUMN public.site_personalizacoes.visao_missao_valores IS 'Visão, missão e valores da empresa';
COMMENT ON COLUMN public.site_personalizacoes.historia_empresa IS 'História da empresa';
COMMENT ON COLUMN public.site_personalizacoes.mercado_atuacao IS 'Mercado de atuação da empresa';
COMMENT ON COLUMN public.site_personalizacoes.produtos IS 'Produtos oferecidos pela empresa';