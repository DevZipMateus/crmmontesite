-- Restore public read access to leads while keeping writes restricted
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public read-only policy
DROP POLICY IF EXISTS "leads_select_public" ON public.leads;
CREATE POLICY "leads_select_public"
ON public.leads
FOR SELECT
USING (true);

-- Keep existing authenticated-only INSERT/UPDATE/DELETE policies intact