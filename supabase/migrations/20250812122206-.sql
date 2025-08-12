-- Restore public read access to projects while keeping writes restricted
-- 1) Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2) Allow public SELECT so the frontend (anon key) can read projects without a Supabase session
DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
CREATE POLICY "projects_select_public"
ON public.projects
FOR SELECT
USING (true);

-- Keep existing authenticated-only policies for INSERT/UPDATE/DELETE intact
-- This preserves write protection while restoring visibility