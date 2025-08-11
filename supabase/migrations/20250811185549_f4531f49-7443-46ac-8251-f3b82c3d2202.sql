-- Harden functions created in previous migration by setting fixed search_path

-- trigger_status_webhook with fixed search_path
CREATE OR REPLACE FUNCTION public.trigger_status_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
BEGIN
  IF NEW.partner_hash IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.webhook_logs (
      project_id, webhook_type, payload, status
    ) VALUES (
      NEW.id,
      'sent',
      jsonb_build_object(
        'type','status_change',
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

  IF NEW.partner_hash IS NOT NULL AND OLD.domain IS DISTINCT FROM NEW.domain THEN
    INSERT INTO public.webhook_logs (
      project_id, webhook_type, payload, status
    ) VALUES (
      NEW.id,
      'sent',
      jsonb_build_object(
        'type','domain_change',
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

-- process_webhook_automatically with fixed search_path
CREATE OR REPLACE FUNCTION public.process_webhook_automatically()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
DECLARE
  partner_record RECORD;
  webhook_response RECORD;
  request_headers jsonb;
BEGIN
  IF NEW.webhook_type = 'sent' AND NEW.status = 'pending' THEN
    SELECT p.webhook_url, p.auth_token
      INTO partner_record
    FROM public.projects proj
    JOIN public.partners p ON p.hash = proj.partner_hash
    WHERE proj.id = NEW.project_id;

    IF partner_record.webhook_url IS NULL THEN
      UPDATE public.webhook_logs
      SET status = 'failed',
          error_message = 'URL do webhook não configurada',
          updated_at = now()
      WHERE id = NEW.id;
      RETURN NEW;
    END IF;

    request_headers := jsonb_build_object('Content-Type','application/json');
    IF partner_record.auth_token IS NOT NULL THEN
      request_headers := request_headers || jsonb_build_object('Authorization', 'Bearer ' || partner_record.auth_token);
    END IF;

    SELECT * INTO webhook_response
    FROM net.http_post(
      url := partner_record.webhook_url,
      headers := request_headers,
      body := NEW.payload::text
    );

    IF webhook_response.status_code BETWEEN 200 AND 299 THEN
      UPDATE public.webhook_logs
      SET status = 'success', response = webhook_response.content, updated_at = now()
      WHERE id = NEW.id;
    ELSE
      UPDATE public.webhook_logs
      SET status = 'failed', response = webhook_response.content,
          error_message = 'HTTP ' || webhook_response.status_code::text, updated_at = now()
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
