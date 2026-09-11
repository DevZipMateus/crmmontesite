-- Este CRM não usa sessões reais do Supabase Auth (login é uma flag local no
-- navegador, sem signInWithPassword), então toda chamada do frontend roda com o
-- papel "anon", nunca "authenticated". As políticas criadas nas migrations
-- anteriores (20260911180000, 20260911190000) restritas a "authenticated" nunca
-- seriam satisfeitas nesta app. Substituindo por políticas abertas a
-- anon + authenticated, igual ao padrão já usado em outras tabelas do projeto
-- (ex.: delivery_terms).

DROP POLICY IF EXISTS "Authenticated users can read hosting plans" ON public.hosting_plans;
DROP POLICY IF EXISTS "Authenticated users can read hosting websites" ON public.hosting_websites;
DROP POLICY IF EXISTS "Authenticated users can update hosting websites" ON public.hosting_websites;
DROP POLICY IF EXISTS "Authenticated users can read hosting events" ON public.hosting_events;
DROP POLICY IF EXISTS "Authenticated users can insert hosting events" ON public.hosting_events;

CREATE POLICY "Anon and authenticated can read hosting plans"
  ON public.hosting_plans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon and authenticated can read hosting websites"
  ON public.hosting_websites FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon and authenticated can update hosting websites"
  ON public.hosting_websites FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can read hosting events"
  ON public.hosting_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon and authenticated can insert hosting events"
  ON public.hosting_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
