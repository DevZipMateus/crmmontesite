
-- Criar extensões necessárias para requisições HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para processar webhook automaticamente
CREATE OR REPLACE FUNCTION public.process_webhook_automatically()
RETURNS trigger AS $$
DECLARE
  partner_record RECORD;
  webhook_response RECORD;
  request_headers jsonb;
BEGIN
  -- Só processar webhooks do tipo 'sent' que estão pendentes
  IF NEW.webhook_type = 'sent' AND NEW.status = 'pending' THEN
    
    -- Buscar dados do parceiro
    SELECT p.webhook_url, p.auth_token
    INTO partner_record
    FROM public.projects proj
    JOIN public.partners p ON p.hash = proj.partner_hash
    WHERE proj.id = NEW.project_id;
    
    -- Verificar se o parceiro tem URL de webhook configurada
    IF partner_record.webhook_url IS NOT NULL THEN
      
      -- Preparar headers
      request_headers := '{"Content-Type": "application/json"}'::jsonb;
      
      -- Adicionar token de autenticação se disponível
      IF partner_record.auth_token IS NOT NULL THEN
        request_headers := request_headers || jsonb_build_object('Authorization', 'Bearer ' || partner_record.auth_token);
      END IF;
      
      -- Fazer requisição HTTP assíncrona
      SELECT INTO webhook_response *
      FROM net.http_post(
        url := partner_record.webhook_url,
        headers := request_headers,
        body := NEW.payload::text
      );
      
      -- Atualizar status baseado na resposta
      IF webhook_response.status_code BETWEEN 200 AND 299 THEN
        UPDATE public.webhook_logs 
        SET 
          status = 'success',
          response = webhook_response.content,
          updated_at = now()
        WHERE id = NEW.id;
      ELSE
        UPDATE public.webhook_logs 
        SET 
          status = 'failed',
          response = webhook_response.content,
          error_message = 'HTTP ' || webhook_response.status_code::text,
          updated_at = now()
        WHERE id = NEW.id;
      END IF;
      
    ELSE
      -- Marcar como falha se não tem URL configurada
      UPDATE public.webhook_logs 
      SET 
        status = 'failed',
        error_message = 'URL do webhook não configurada',
        updated_at = now()
      WHERE id = NEW.id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para processar webhooks automaticamente
DROP TRIGGER IF EXISTS auto_process_webhook_trigger ON public.webhook_logs;
CREATE TRIGGER auto_process_webhook_trigger
  AFTER INSERT ON public.webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.process_webhook_automatically();

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type_status ON public.webhook_logs(webhook_type, status);
CREATE INDEX IF NOT EXISTS idx_projects_partner_hash ON public.projects(partner_hash);
