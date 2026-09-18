-- Sinaliza sites cujo domínio não está entregando o conteúdo real (ex: DNS
-- ainda apontando pra outra hospedagem, mostrando a página padrão dela) -
-- um problema diferente de "sem hospedagem" (aqui o site EXISTE e está
-- provisionado certinho, só o domínio não está apontando pro lugar certo).
-- Corrigir isso depende do dono do domínio/DNS, não do time interno.
ALTER TABLE public.hosting_websites
  ADD COLUMN needs_client_action boolean NOT NULL DEFAULT false,
  ADD COLUMN client_action_note text;

COMMENT ON COLUMN public.hosting_websites.needs_client_action IS
  'true quando o domínio não está servindo o conteúdo real (ex: DNS apontando pra outra hospedagem) - precisa de ação do cliente/dono do domínio, não é sobre o código nem sobre nossa hospedagem.';
