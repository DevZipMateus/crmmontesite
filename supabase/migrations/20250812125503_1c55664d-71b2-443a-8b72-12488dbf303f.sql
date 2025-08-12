
-- Permitir UPDATE público (anon) em projects para restaurar a edição de domínio/status
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_update_public" ON public.projects;

CREATE POLICY "projects_update_public"
ON public.projects
FOR UPDATE
USING (true)
WITH CHECK (true);
