-- Monitoramento de hospedagem Hostinger: planos, sites e histórico de mudanças

CREATE TABLE public.hosting_plans (
  order_id BIGINT NOT NULL PRIMARY KEY,
  plan_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  site_count INTEGER NOT NULL DEFAULT 0,
  site_limit INTEGER,
  disk_bytes_used BIGINT,
  disk_bytes_limit BIGINT,
  last_synced_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.hosting_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id BIGINT NOT NULL,
  external_uid TEXT,
  domain TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_placeholder BOOLEAN NOT NULL DEFAULT false,
  linked_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (order_id, domain)
);

CREATE TABLE public.hosting_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  order_id BIGINT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_hosting_websites_order_id ON public.hosting_websites(order_id);
CREATE INDEX idx_hosting_websites_domain ON public.hosting_websites(domain);
CREATE INDEX idx_hosting_websites_deleted_at ON public.hosting_websites(deleted_at);
CREATE INDEX idx_hosting_websites_linked_project_id ON public.hosting_websites(linked_project_id);
CREATE INDEX idx_hosting_events_created_at ON public.hosting_events(created_at DESC);

ALTER TABLE public.hosting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_events ENABLE ROW LEVEL SECURITY;

-- Somente usuários autenticados do CRM enxergam estes dados; a Edge Function
-- de sincronização usa a service role key e não passa pelas policies abaixo.
CREATE POLICY "Authenticated users can read hosting plans"
  ON public.hosting_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read hosting websites"
  ON public.hosting_websites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read hosting events"
  ON public.hosting_events FOR SELECT
  TO authenticated
  USING (true);

-- Agendamento automático da sincronização a cada 6 horas via pg_cron + pg_net.
-- O segredo 'cron_hosting_sync_secret' precisa existir no Supabase Vault com o MESMO
-- valor configurado como segredo CRON_SYNC_SECRET da Edge Function hosting-sync
-- (rodar uma vez: select vault.create_secret('<string-aleatoria>', 'cron_hosting_sync_secret');
-- e depois: supabase secrets set CRON_SYNC_SECRET=<a-mesma-string-aleatoria>)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'hosting-sync-job',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vaabpicspdbolvutnscp.supabase.co/functions/v1/hosting-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'cron_hosting_sync_secret'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
