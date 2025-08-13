-- Permitir INSERT público na tabela projects para clientes diretos
DROP POLICY IF EXISTS "projects_insert_public" ON public.projects;

CREATE POLICY "projects_insert_public"
ON public.projects
FOR INSERT
WITH CHECK (true);

-- Permitir INSERT público na tabela site_personalizacoes (necessário para clientes diretos)
ALTER TABLE public.site_personalizacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on site_personalizacoes" ON public.site_personalizacoes;

CREATE POLICY "Allow public insert on site_personalizacoes"
ON public.site_personalizacoes
FOR INSERT
WITH CHECK (true);