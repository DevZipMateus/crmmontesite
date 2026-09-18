-- Sites sem hospedagem (nem Hostinger, nem VPS) só existem como backup de código
-- em algum repositório GitHub. Guarda o link pra esse backup direto no registro.
ALTER TABLE public.hosting_websites
  ADD COLUMN github_backup_url text;

COMMENT ON COLUMN public.hosting_websites.github_backup_url IS
  'Link do repositório GitHub com o backup do código, para sites marcados is_decommissioned (sem hospedagem em lugar nenhum).';
