
-- Adicionar campos necessários na tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS partner_hash text,
ADD COLUMN IF NOT EXISTS partner_webhook_url text,
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS project_source text DEFAULT 'direto';

-- Criar tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  webhook_type text NOT NULL, -- 'received' ou 'sent'
  payload jsonb NOT NULL,
  status text NOT NULL, -- 'success', 'failed', 'pending'
  response text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para gerenciar parceiros
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash text UNIQUE NOT NULL,
  name text NOT NULL,
  webhook_url text,
  auth_token text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Políticas RLS permissivas para as novas tabelas (ajustar conforme necessário)
CREATE POLICY "Allow all operations on webhook_logs" 
ON public.webhook_logs 
FOR ALL 
USING (true);

CREATE POLICY "Allow all operations on partners" 
ON public.partners 
FOR ALL 
USING (true);

-- Função para disparar webhook quando status do projeto mudar
CREATE OR REPLACE FUNCTION public.trigger_status_webhook()
RETURNS trigger AS $$
BEGIN
  -- Verificar se é um projeto de parceiro e se o status mudou
  IF NEW.partner_hash IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Inserir na fila de webhook para processamento
    INSERT INTO public.webhook_logs (
      project_id, 
      webhook_type, 
      payload, 
      status
    ) VALUES (
      NEW.id,
      'sent',
      jsonb_build_object(
        'status', NEW.status,
        'nome', NEW.client_name,
        'email', 'placeholder@email.com', -- Atualizar quando tiver campo email
        'telefone', 'placeholder', -- Atualizar quando tiver campo telefone  
        'cnpj', NEW.cnpj,
        'hash', NEW.partner_hash,
        'data_status', now(),
        'domain', NEW.domain
      ),
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para disparar webhook
DROP TRIGGER IF EXISTS project_status_webhook_trigger ON public.projects;
CREATE TRIGGER project_status_webhook_trigger
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_status_webhook();

-- Atualizar função de updated_at para as novas tabelas
CREATE TRIGGER update_webhook_logs_updated_at
  BEFORE UPDATE ON public.webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
