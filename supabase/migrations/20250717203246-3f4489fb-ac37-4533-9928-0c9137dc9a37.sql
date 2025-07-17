
-- Remover triggers duplicados e problemáticos
DROP TRIGGER IF EXISTS sync_lead_project_status_projects ON public.projects;
DROP TRIGGER IF EXISTS sync_lead_project_status_leads ON public.leads;

-- Corrigir a função sync_lead_project_status para lidar corretamente com os campos de cada tabela
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
RETURNS trigger AS $$
BEGIN
  -- Quando um projeto muda de status, atualizar o lead relacionado
  IF TG_TABLE_NAME = 'projects' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Atualizar situação do lead baseado no status do projeto
    UPDATE leads 
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

  -- Quando um lead muda de situação, verificar se deve criar projeto
  IF TG_TABLE_NAME = 'leads' AND OLD.situacao IS DISTINCT FROM NEW.situacao THEN
    -- Se lead chegou em "Em Desenvolvimento" e não tem projeto, criar um
    IF NEW.situacao = 'Em Desenvolvimento' AND NEW.project_id IS NULL THEN
      INSERT INTO projects (
        client_name,
        template,
        status,
        responsible_name,
        blaster_link,
        lead_id,
        project_source
      ) VALUES (
        NEW.empresa,
        'A definir',
        'Recebido',
        NEW.vendedor,
        NEW.link_blaster,
        NEW.id,
        'lead_conversion'
      );
      
      -- Atualizar o lead com o ID do projeto criado
      UPDATE leads 
      SET project_id = (
        SELECT id FROM projects 
        WHERE lead_id = NEW.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      link_confidence_score = 100,
      link_method = 'auto_created'
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar os triggers corretamente (apenas um para cada tabela)
CREATE TRIGGER sync_lead_project_status_projects
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_project_status();

CREATE TRIGGER sync_lead_project_status_leads
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_project_status();

-- Verificar se existem triggers duplicados do trigger_status_webhook e remover extras
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE c.relname = 'projects' AND t.tgname = 'trigger_status_webhook';
    
    -- Se houver mais de um trigger, remover todos e recriar apenas um
    IF trigger_count > 1 THEN
        DROP TRIGGER IF EXISTS trigger_status_webhook ON public.projects;
        
        CREATE TRIGGER trigger_status_webhook
          AFTER UPDATE ON public.projects
          FOR EACH ROW
          EXECUTE FUNCTION public.trigger_status_webhook();
    END IF;
END $$;
