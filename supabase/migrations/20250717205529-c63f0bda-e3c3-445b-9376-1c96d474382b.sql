
-- Corrigir a função sync_lead_project_status para evitar erro de campo inexistente
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
RETURNS trigger AS $$
BEGIN
  -- Quando um projeto muda de status, atualizar o lead relacionado
  IF TG_TABLE_NAME = 'projects' THEN
    -- Verificar se o status mudou
    IF OLD.status IS DISTINCT FROM NEW.status THEN
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
  END IF;

  -- Quando um lead muda de situação, verificar se deve criar projeto
  IF TG_TABLE_NAME = 'leads' THEN
    -- Verificar se a situação mudou
    IF OLD.situacao IS DISTINCT FROM NEW.situacao THEN
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
