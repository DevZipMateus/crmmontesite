-- Primeiro, remover a constraint existente
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Atualizar os dados: "Configurando Domínio" para "Aguardando Alterações"
UPDATE public.projects 
SET status = 'Aguardando Alterações' 
WHERE status = 'Configurando Domínio';

-- Criar nova constraint incluindo todos os status válidos (incluindo os existentes)
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
CHECK (status IN (
  'Em andamento',
  'Recebido', 
  'Criando site',
  'Em Customização',
  'Aguardando Alterações',
  'Site pronto'
));

-- Atualizar função de sincronização para incluir o novo status
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
        WHEN NEW.status = 'Em Customização' THEN 'Em Customização'
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
        WHEN NEW.situacao = 'Em Customização' THEN 'Em Customização'
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