
-- Corrige o erro 42P01 ao referenciar a tabela leads dentro da função de sincronização
-- Ajuste: define search_path para 'public, pg_temp' e qualifica as tabelas com 'public.'
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
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
        WHEN NEW.situacao = 'Configurando Domínio' THEN 'Configurando Domínio'
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
