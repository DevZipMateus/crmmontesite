-- 1) Clean up existing overly-permissive policies on projects and enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop any existing policies on projects
  PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='projects';
  IF FOUND THEN
    EXECUTE (
      SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.projects;', polname), E'\n')
      FROM pg_policies
      WHERE schemaname='public' AND tablename='projects'
    );
  END IF;
END $$;

-- 2) Core policies: authenticated users have full CRUD
CREATE POLICY "projects_select_authenticated"
ON public.projects
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "projects_insert_authenticated"
ON public.projects
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_update_authenticated"
ON public.projects
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_delete_authenticated"
ON public.projects
FOR DELETE
USING (auth.role() = 'authenticated');

-- 3) Secure public access via RPC only (no open anon selects)
-- We'll expose a SECURITY DEFINER function to fetch a project by client_submission_hash
-- so the public client submission page can work without exposing the whole table.
CREATE OR REPLACE FUNCTION public.get_project_by_submission_hash(p_hash text)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  proj public.projects;
BEGIN
  SELECT * INTO proj
  FROM public.projects
  WHERE client_submission_hash = p_hash
  LIMIT 1;

  RETURN proj;
END;
$$;

-- Allow public to execute the RPC
GRANT EXECUTE ON FUNCTION public.get_project_by_submission_hash(text) TO anon, authenticated;

-- 4) Optional: allow partners (anon role calling from external systems) to update status/domain via webhook token
-- We will not allow blanket anon updates; instead, webhook updates should go through edge functions using the service role.
-- Therefore, no anon update policy is created here for safety.

-- 5) Comments: Any public-facing flows should now call the RPC instead of direct table select.
