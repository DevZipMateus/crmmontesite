
-- 1. Remover a constraint antiga
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- 2. Migrar projetos existentes
UPDATE public.projects SET status = 'Victor' WHERE status = 'Criando site';
UPDATE public.projects SET status = 'Davi' WHERE status = 'Aguardando Alterações';

-- 3. Adicionar nova constraint com os valores permitidos
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('Recebido', 'Victor', 'Davi', 'Sem retorno', 'Site pronto', 'Em Customização', 'Em andamento'));

-- 4. Atualizar a função sync_lead_project_status
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'projects' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      UPDATE public.leads 
      SET situacao = CASE 
        WHEN NEW.status = 'Recebido' THEN 'Preenchendo Formulário'
        WHEN NEW.status = 'Victor' THEN 'Em Desenvolvimento'
        WHEN NEW.status = 'Davi' THEN 'Em Desenvolvimento'
        WHEN NEW.status = 'Em Customização' THEN 'Em Customização'
        WHEN NEW.status = 'Sem retorno' THEN 'Sem Retorno'
        WHEN NEW.status = 'Site pronto' THEN 'Site Pronto'
        ELSE situacao
      END,
      data_ultimo_contato = now(),
      updated_at = now()
      WHERE id = NEW.lead_id AND NEW.lead_id IS NOT NULL;
    END IF;
  END IF;

  IF TG_TABLE_NAME = 'leads' THEN
    IF OLD.situacao IS DISTINCT FROM NEW.situacao AND NEW.project_id IS NOT NULL THEN
      UPDATE public.projects 
      SET status = CASE 
        WHEN NEW.situacao = 'Preenchendo Formulário' THEN 'Recebido'
        WHEN NEW.situacao = 'Em Desenvolvimento' THEN 'Victor'
        WHEN NEW.situacao = 'Em Customização' THEN 'Em Customização'
        WHEN NEW.situacao = 'Sem Retorno' THEN 'Sem retorno'
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
