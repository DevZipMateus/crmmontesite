-- Rastreia o repositório GitHub associado automaticamente a cada site e se o
-- conteúdo publicado (Hostinger/VPS) bate com o último commit desse repositório.
ALTER TABLE public.hosting_websites
  ADD COLUMN github_repo_owner text,
  ADD COLUMN github_repo_name text,
  ADD COLUMN github_commit_sha text,
  ADD COLUMN github_commit_at timestamptz,
  ADD COLUMN github_sync_status text,
  ADD COLUMN github_checked_at timestamptz;

COMMENT ON COLUMN public.hosting_websites.github_repo_owner IS
  'Dono do repositório no GitHub (organização Montesite), casado automaticamente por domínio/nome do cliente.';
COMMENT ON COLUMN public.hosting_websites.github_sync_status IS
  'synced = HTML ao vivo bate com o último commit; outdated = não bate; source_only = repositório guarda projeto-fonte (Vite/React), sem veredito de frescor; no_match = nenhum repositório encontrado; no_live_site = sem site pra comparar (sem hospedagem); fetch_error = falha ao buscar site ou repositório.';
