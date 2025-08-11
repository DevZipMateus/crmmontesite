-- Improve auto-processing: fallback to project.partner_webhook_url and provider_credentials when partner not found
CREATE OR REPLACE FUNCTION public.process_webhook_automatically()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
DECLARE
  partner_record RECORD;
  proj_record RECORD;
  effective_url text;
  bearer_token text;
  webhook_response RECORD;
  request_headers jsonb;
BEGIN
  IF NEW.webhook_type = 'sent' AND NEW.status = 'pending' THEN
    -- Load project
    SELECT partner_webhook_url, provider_credentials
      INTO proj_record
    FROM public.projects
    WHERE id = NEW.project_id;

    -- Load partner (might not exist)
    SELECT p.webhook_url, p.auth_token
      INTO partner_record
    FROM public.projects proj
    JOIN public.partners p ON p.hash = proj.partner_hash
    WHERE proj.id = NEW.project_id;

    -- Choose effective URL and token with sensible fallback
    effective_url := COALESCE(partner_record.webhook_url, proj_record.partner_webhook_url);
    bearer_token := COALESCE(partner_record.auth_token, proj_record.provider_credentials);

    IF effective_url IS NULL OR length(trim(effective_url)) = 0 THEN
      UPDATE public.webhook_logs
      SET status = 'failed',
          error_message = 'URL do webhook não configurada (parceiro e projeto vazios)',
          updated_at = now()
      WHERE id = NEW.id;
      RETURN NEW;
    END IF;

    -- Prepare headers
    request_headers := jsonb_build_object('Content-Type','application/json');
    IF bearer_token IS NOT NULL AND length(trim(bearer_token)) > 0 THEN
      request_headers := request_headers || jsonb_build_object('Authorization', 'Bearer ' || bearer_token);
    END IF;

    -- HTTP POST
    SELECT * INTO webhook_response
    FROM net.http_post(
      url := effective_url,
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
