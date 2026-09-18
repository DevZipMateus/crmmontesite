-- Sites que saíram da Hostinger mas NÃO foram migrados pra VPS (domínio morto,
-- cancelado, ou removido manualmente pelo painel) — não têm hospedagem em
-- lugar nenhum, só backup local. Até aqui isso era indistinguível de "migrado
-- pra VPS" (ambos só tinham deleted_at preenchido), o que gerava contagem
-- errada no CRM (ver hosting_events / MIGRACOES.md do projeto de migração).
ALTER TABLE public.hosting_websites
  ADD COLUMN is_decommissioned boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.hosting_websites.is_decommissioned IS
  'true = saiu da Hostinger e não tem hospedagem em lugar nenhum (só backup local). false + deleted_at preenchido = migrado pra VPS.';

-- Repõe os 6 sites que tinham sido removidos da tabela por engano (haviam
-- saído da Hostinger por motivo diferente de migração pra VPS: domínio morto/
-- suspenso, ou em outra conta Hostinger sem relação com a VPS).
INSERT INTO public.hosting_websites
  (order_id, external_uid, domain, platform, is_placeholder, linked_project_id, first_seen_at, last_seen_at, deleted_at, is_decommissioned)
VALUES
  (1007606048, 'Suvz4HCFS', 'mportasautomaticas.com.br', 'h5g', false, '6f622638-a0f0-40fa-aa58-8ac05a6876b8', '2026-09-11 18:30:19.623+00', '2026-09-18 13:45:33.273+00', '2026-09-18 13:45:33.273+00', true),
  (1006919997, null, 'bpofinanceirofg.com.br', 'cloudlinux', false, null, '2026-09-11 18:30:19.623+00', '2026-09-18 13:45:33.273+00', '2026-09-18 13:45:33.273+00', true),
  (1006919997, null, 'lojadogesseiropa.com', 'cloudlinux', false, 'b53675d4-527f-4c0e-bd53-04da63c65848', '2026-09-11 18:30:19.623+00', '2026-09-18 13:45:33.273+00', '2026-09-18 13:45:33.273+00', true),
  (1006919997, null, 'malagoliscolecionaveis.com.br', 'cloudlinux', false, null, '2026-09-11 18:30:19.623+00', '2026-09-18 13:45:33.273+00', '2026-09-18 13:45:33.273+00', true),
  (1006919997, null, 'masteralarmes.com', 'cloudlinux', false, null, '2026-09-11 18:30:19.623+00', '2026-09-18 13:45:33.273+00', '2026-09-18 13:45:33.273+00', true),
  (1006919997, null, 'melhoressolucoes.com.br', 'cloudlinux', false, null, '2026-09-11 18:30:19.623+00', '2026-09-18 13:45:33.273+00', '2026-09-18 13:45:33.273+00', true)
ON CONFLICT (order_id, domain) DO UPDATE SET
  is_decommissioned = true,
  deleted_at = coalesce(public.hosting_websites.deleted_at, excluded.deleted_at);
