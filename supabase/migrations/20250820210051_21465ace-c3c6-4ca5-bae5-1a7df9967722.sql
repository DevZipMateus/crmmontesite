-- 1) Relax and update status constraint to include the new value and keep backward compatibility
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
CHECK (status IN (
  'Em andamento',
  'Recebido',
  'Criando site',
  'Configurando Domínio',
  'Aguardando Alterações',
  'Site pronto'
));

-- 2) Update sync function to handle the new status both ways
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Quando um projeto muda de status, atualizar o lead relacionado
  IF TG_TABLE_NAME = 'projects' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      UPDATE public.leads 
      SET situacao = CASE 
        WHEN NEW.status = 'Recebido' THEN 'Preenchendo Formulário'
        WHEN NEW.status = 'Criando site' THEN 'Em Desenvolvimento'
        WHEN NEW.status = 'Configurando Domínio' THEN 'Configurando Domínio'
        WHEN NEW.status = 'Aguardando Alterações' THEN 'Configurando Domínio'
        WHEN NEW.status = 'Site pronto' THEN 'Site Pronto'
        ELSE situacao
      END,
      data_ultimo_contato = now(),
      updated_at = now()
      WHERE id = NEW.lead_id AND NEW.lead_id IS NOT NULL;
    END IF;
  END IF;

  -- Quando um lead muda de situação, sincronizar com projeto existente
  IF TG_TABLE_NAME = 'leads' THEN
    IF OLD.situacao IS DISTINCT FROM NEW.situacao AND NEW.project_id IS NOT NULL THEN
      UPDATE public.projects 
      SET status = CASE 
        WHEN NEW.situacao = 'Preenchendo Formulário' THEN 'Recebido'
        WHEN NEW.situacao = 'Em Desenvolvimento' THEN 'Criando site'
        WHEN NEW.situacao = 'Configurando Domínio' THEN 'Aguardando Alterações'
        WHEN NEW.situacao = 'Site Pronto' THEN 'Site pronto'
        ELSE status
      END,
      updated_at = now()
      WHERE id = NEW.project_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Migrate existing data to the new status
UPDATE public.projects 
SET status = 'Aguardando Alterações' 
WHERE status = 'Configurando Domínio';