
-- Garantir que a RLS está habilitada (já deve estar, mas é inofensivo repetir)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público em leads
CREATE POLICY IF NOT EXISTS leads_insert_public
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Permitir UPDATE público em leads
CREATE POLICY IF NOT EXISTS leads_update_public
  ON public.leads
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
