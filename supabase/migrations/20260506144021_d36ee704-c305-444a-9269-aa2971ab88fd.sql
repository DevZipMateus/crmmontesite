
-- ============================================================
-- 1. ADMIN-ONLY: auth_logs
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on auth_logs" ON public.auth_logs;
CREATE POLICY "auth_logs_authenticated_all" ON public.auth_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 2. ADMIN-ONLY: partners (contains auth tokens!)
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on partners" ON public.partners;
CREATE POLICY "partners_authenticated_all" ON public.partners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 3. ADMIN-ONLY: webhook_logs
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations on webhook_logs" ON public.webhook_logs;
CREATE POLICY "webhook_logs_authenticated_all" ON public.webhook_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 4. ADMIN-ONLY: integration_settings
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to insert integration_settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update integration_settings" ON public.integration_settings;
DROP POLICY IF EXISTS "Allow authenticated users to view integration_settings" ON public.integration_settings;

CREATE POLICY "integration_settings_authenticated_select" ON public.integration_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "integration_settings_authenticated_insert" ON public.integration_settings
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "integration_settings_authenticated_update" ON public.integration_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 5. ADMIN-ONLY: lead_notes
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations for authenticated users on lead_notes" ON public.lead_notes;
CREATE POLICY "lead_notes_authenticated_all" ON public.lead_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 6. ADMIN-ONLY: lead_agendamentos
-- ============================================================
DROP POLICY IF EXISTS "Allow all operations for authenticated users on lead_agendament" ON public.lead_agendamentos;
CREATE POLICY "lead_agendamentos_authenticated_all" ON public.lead_agendamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 7. ADMIN-ONLY: project_customizations
-- ============================================================
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.project_customizations;
CREATE POLICY "project_customizations_authenticated_all" ON public.project_customizations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 8. PUBLIC READ / AUTHENTICATED WRITE: categories
-- ============================================================
DROP POLICY IF EXISTS "Enable delete for categories" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for categories" ON public.categories;
DROP POLICY IF EXISTS "Enable update for categories" ON public.categories;
-- Keep "Public can view categories" SELECT policy

CREATE POLICY "categories_authenticated_insert" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categories_authenticated_update" ON public.categories
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "categories_authenticated_delete" ON public.categories
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 9. PUBLIC READ / AUTHENTICATED WRITE: showcases
-- ============================================================
DROP POLICY IF EXISTS "Enable delete for showcases" ON public.showcases;
DROP POLICY IF EXISTS "Enable insert for showcases" ON public.showcases;
DROP POLICY IF EXISTS "Enable update for showcases" ON public.showcases;
DROP POLICY IF EXISTS "Enable select for showcases" ON public.showcases;
-- Keep "Public can view showcases"

CREATE POLICY "showcases_authenticated_insert" ON public.showcases
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "showcases_authenticated_update" ON public.showcases
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "showcases_authenticated_delete" ON public.showcases
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 10. PUBLIC READ / AUTHENTICATED WRITE: model_templates
-- ============================================================
DROP POLICY IF EXISTS "Allow anon delete on model_templates" ON public.model_templates;
DROP POLICY IF EXISTS "Allow anon insert on model_templates" ON public.model_templates;
DROP POLICY IF EXISTS "Allow anon update on model_templates" ON public.model_templates;
-- Keep anon SELECT and authenticated CRUD policies
