-- Atualizar a função sync_lead_project_status para NÃO criar projetos automaticamente
CREATE OR REPLACE FUNCTION public.sync_lead_project_status()
RETURNS TRIGGER AS $$
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

  -- Quando um lead muda de situação, apenas sincronizar com projeto existente
  IF TG_TABLE_NAME = 'leads' THEN
    -- Verificar se a situação mudou e se existe projeto vinculado
    IF OLD.situacao IS DISTINCT FROM NEW.situacao AND NEW.project_id IS NOT NULL THEN
      -- Atualizar status do projeto baseado na situação do lead
      UPDATE projects 
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '';