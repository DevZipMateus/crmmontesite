-- Secure RLS for public.leads to prevent public data exposure
-- 1) Enable RLS and drop any existing policies on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leads') THEN
    EXECUTE (
      SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.leads;', policyname), E'\n')
      FROM pg_policies
      WHERE schemaname='public' AND tablename='leads'
    );
  END IF;
END $$;

-- 2) Authenticated-only access policies (granular CRUD)
CREATE POLICY "leads_select_authenticated"
ON public.leads
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "leads_insert_authenticated"
ON public.leads
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "leads_update_authenticated"
ON public.leads
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "leads_delete_authenticated"
ON public.leads
FOR DELETE
USING (auth.role() = 'authenticated');

-- Notes:
-- - No anon (public) policies are created to avoid exposing sensitive PII.
-- - Edge Functions should use the service role key and will bypass RLS safely.
