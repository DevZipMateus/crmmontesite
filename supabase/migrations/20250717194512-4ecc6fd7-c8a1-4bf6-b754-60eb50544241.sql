
-- Adicionar campos de vinculação na tabela leads
ALTER TABLE public.leads 
ADD COLUMN project_id UUID REFERENCES public.projects(id),
ADD COLUMN link_confidence_score INTEGER DEFAULT 0,
ADD COLUMN link_method TEXT;

-- Adicionar campo de vinculação na tabela projects
ALTER TABLE public.projects 
ADD COLUMN lead_id UUID REFERENCES public.leads(id);

-- Criar índices para melhorar performance das consultas de vinculação
CREATE INDEX idx_leads_project_id ON public.leads(project_id);
CREATE INDEX idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX idx_leads_link_confidence ON public.leads(link_confidence_score);

-- Função para extrair ID do blaster link
CREATE OR REPLACE FUNCTION public.extract_blaster_id(blaster_url TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN blaster_url ~ '#[0-9]+' THEN 
      regexp_replace(blaster_url, '.*#([0-9]+).*', '\1')
    ELSE NULL
  END;
$$;

-- Função para calcular similaridade entre strings (Levenshtein simplificado)
CREATE OR REPLACE FUNCTION public.string_similarity(str1 TEXT, str2 TEXT)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  len1 INT := length(str1);
  len2 INT := length(str2);
  max_len INT := greatest(len1, len2);
BEGIN
  -- Se uma das strings é vazia, retorna 0
  IF max_len = 0 THEN RETURN 1.0; END IF;
  
  -- Similaridade básica baseada em substring comum
  IF lower(str1) = lower(str2) THEN RETURN 1.0; END IF;
  IF position(lower(str1) in lower(str2)) > 0 OR position(lower(str2) in lower(str1)) > 0 THEN 
    RETURN 0.8; 
  END IF;
  
  RETURN 0.0;
END;
$$;

-- Função principal para vinculação automática de leads e projetos
CREATE OR REPLACE FUNCTION public.auto_link_leads_projects()
RETURNS TABLE(lead_id UUID, project_id UUID, confidence_score INTEGER, link_method TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Método 1: Vinculação por Blaster Link ID (100% confiança)
  RETURN QUERY
  SELECT 
    l.id as lead_id,
    p.id as project_id,
    100 as confidence_score,
    'blaster_id' as link_method
  FROM leads l
  JOIN projects p ON public.extract_blaster_id(l.link_blaster) = public.extract_blaster_id(p.blaster_link)
  WHERE l.project_id IS NULL 
    AND p.lead_id IS NULL
    AND l.link_blaster IS NOT NULL 
    AND p.blaster_link IS NOT NULL
    AND public.extract_blaster_id(l.link_blaster) IS NOT NULL
    AND public.extract_blaster_id(p.blaster_link) IS NOT NULL;

  -- Método 2: Vinculação por nome exato da empresa (90% confiança)
  RETURN QUERY
  SELECT 
    l.id as lead_id,
    p.id as project_id,
    90 as confidence_score,
    'exact_name' as link_method
  FROM leads l
  JOIN projects p ON lower(trim(l.empresa)) = lower(trim(p.client_name))
  WHERE l.project_id IS NULL 
    AND p.lead_id IS NULL
    AND l.empresa IS NOT NULL 
    AND p.client_name IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM leads l2 
      JOIN projects p2 ON public.extract_blaster_id(l2.link_blaster) = public.extract_blaster_id(p2.blaster_link)
      WHERE l2.id = l.id AND p2.id = p.id
    );

  -- Método 3: Vinculação por nome do cliente (80% confiança)
  RETURN QUERY
  SELECT 
    l.id as lead_id,
    p.id as project_id,
    80 as confidence_score,
    'client_name' as link_method
  FROM leads l
  JOIN projects p ON lower(trim(l.nome_cliente)) = lower(trim(p.client_name))
  WHERE l.project_id IS NULL 
    AND p.lead_id IS NULL
    AND l.nome_cliente IS NOT NULL 
    AND p.client_name IS NOT NULL
    AND NOT EXISTS (
      -- Evitar duplicar vinculações já feitas pelos métodos anteriores
      SELECT 1 FROM leads l2 
      WHERE l2.id = l.id AND l2.project_id IS NOT NULL
    );
END;
$$;

-- Trigger para sincronização automática de status
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Quando um projeto muda de status, atualizar o lead relacionado
  IF TG_TABLE_NAME = 'projects' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Atualizar situação do lead baseado no status do projeto
    UPDATE leads 
    SET situacao = CASE 
      WHEN NEW.status = 'Recebido' THEN 'Preenchendo Formulário'
      WHEN NEW.status = 'Em desenvolvimento' THEN 'Em Desenvolvimento'
      WHEN NEW.status = 'Configurando domínio' THEN 'Configurando Domínio'
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
$$;

-- Criar triggers para sincronização
DROP TRIGGER IF EXISTS trigger_sync_lead_project_status_projects ON public.projects;
DROP TRIGGER IF EXISTS trigger_sync_lead_project_status_leads ON public.leads;

CREATE TRIGGER trigger_sync_lead_project_status_projects
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_project_status();

CREATE TRIGGER trigger_sync_lead_project_status_leads
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_project_status();
