
-- Adicionar novos campos na tabela projects para armazenar dados do formulário de personalização
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS modelo_escolhido text,
ADD COLUMN IF NOT EXISTS observacoes_cliente text,
ADD COLUMN IF NOT EXISTS email_complementar text,
ADD COLUMN IF NOT EXISTS formulario_preenchido boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_formulario timestamp with time zone;

-- Criar índice para busca por hash (para melhor performance)
CREATE INDEX IF NOT EXISTS idx_projects_partner_hash ON public.projects(partner_hash);

-- Criar trigger para atualizar updated_at quando formulário for preenchido
CREATE OR REPLACE FUNCTION public.update_project_form_data()
RETURNS trigger AS $$
BEGIN
  -- Se dados do formulário foram atualizados, marcar como preenchido
  IF (NEW.modelo_escolhido IS NOT NULL AND OLD.modelo_escolhido IS NULL) OR
     (NEW.observacoes_cliente IS NOT NULL AND OLD.observacoes_cliente IS NULL) OR
     (NEW.email_complementar IS NOT NULL AND OLD.email_complementar IS NULL) THEN
    NEW.formulario_preenchido = true;
    NEW.data_formulario = now();
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função
DROP TRIGGER IF EXISTS update_form_data_trigger ON public.projects;
CREATE TRIGGER update_form_data_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_form_data();
