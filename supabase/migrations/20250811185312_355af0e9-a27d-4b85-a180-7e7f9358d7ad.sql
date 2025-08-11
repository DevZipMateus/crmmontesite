-- Fix duplicate webhook inserts by consolidating triggers and enable auto-processing

-- 1) Ensure extension for HTTP requests exists
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2) Recreate the trigger function that enqueues webhooks on project updates (status/domain changes)
CREATE OR REPLACE FUNCTION public.trigger_status_webhook()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Status change -> enqueue webhook
  IF NEW.partner_hash IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.webhook_logs (
      project_id,
      webhook_type,
      payload,
      status
    ) VALUES (
      NEW.id,
      'sent',
      jsonb_build_object(
        'type', 'status_change',
        'status', NEW.status,
        'previous_status', OLD.status,
        'nome', NEW.client_name,
        'email', COALESCE(NEW.email_complementar, 'placeholder@email.com'),
        'telefone', COALESCE(NEW.telefone, 'Não informado'),
        'cnpj', NEW.cnpj,
        'hash', NEW.partner_hash,
        'data_status', now(),
        'domain', NEW.domain
      ),
      'pending'
    );
  END IF;

  -- Domain change -> enqueue webhook
  IF NEW.partner_hash IS NOT NULL AND OLD.domain IS DISTINCT FROM NEW.domain THEN
    INSERT INTO public.webhook_logs (
      project_id,
      webhook_type,
      payload,
      status
    ) VALUES (
      NEW.id,
      'sent',
      jsonb_build_object(
        'type', 'domain_change',
        'domain', NEW.domain,
        'previous_domain', OLD.domain,
        'nome', NEW.client_name,
        'telefone', COALESCE(NEW.telefone, 'Não informado'),
        'cnpj', NEW.cnpj,
        'hash', NEW.partner_hash,
        'data_domain', now(),
        'status', NEW.status
      ),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Drop BOTH possible existing triggers to avoid double firing, then create only one
DROP TRIGGER IF EXISTS project_status_webhook_trigger ON public.projects;
DROP TRIGGER IF EXISTS trigger_status_webhook ON public.projects;
CREATE TRIGGER trigger_status_webhook
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_status_webhook();

-- 4) Auto-process pending webhooks right after insert using pg_net
CREATE OR REPLACE FUNCTION public.process_webhook_automatically()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  partner_record RECORD;
  webhook_response RECORD;
  request_headers jsonb;
BEGIN
  -- Only process "sent" type webhooks that are pending
  IF NEW.webhook_type = 'sent' AND NEW.status = 'pending' THEN
    -- Fetch partner configuration
    SELECT p.webhook_url, p.auth_token
      INTO partner_record
    FROM public.projects proj
    JOIN public.partners p ON p.hash = proj.partner_hash
    WHERE proj.id = NEW.project_id;

    -- If no URL, mark failed
    IF partner_record.webhook_url IS NULL THEN
      UPDATE public.webhook_logs
      SET status = 'failed',
          error_message = 'URL do webhook não configurada',
          updated_at = now()
      WHERE id = NEW.id;
      RETURN NEW;
    END IF;

    -- Prepare headers
    request_headers := jsonb_build_object('Content-Type','application/json');
    IF partner_record.auth_token IS NOT NULL THEN
      request_headers := request_headers || jsonb_build_object('Authorization', 'Bearer ' || partner_record.auth_token);
    END IF;

    -- Perform HTTP POST
    SELECT *
      INTO webhook_response
    FROM net.http_post(
      url := partner_record.webhook_url,
      headers := request_headers,
      body := NEW.payload::text
    );

    -- Update log based on response
    IF webhook_response.status_code BETWEEN 200 AND 299 THEN
      UPDATE public.webhook_logs
      SET status = 'success',
          response = webhook_response.content,
          updated_at = now()
      WHERE id = NEW.id;
    ELSE
      UPDATE public.webhook_logs
      SET status = 'failed',
          response = webhook_response.content,
          error_message = 'HTTP ' || webhook_response.status_code::text,
          updated_at = now()
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists exactly once
DROP TRIGGER IF EXISTS auto_process_webhook_trigger ON public.webhook_logs;
CREATE TRIGGER auto_process_webhook_trigger
  AFTER INSERT ON public.webhook_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.process_webhook_automatically();
