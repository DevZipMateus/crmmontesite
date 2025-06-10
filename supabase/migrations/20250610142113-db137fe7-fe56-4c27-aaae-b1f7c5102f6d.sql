
-- Atualizar a função de trigger para webhooks
CREATE OR REPLACE FUNCTION public.trigger_status_webhook()
RETURNS trigger AS $$
BEGIN
  -- Verificar se é um projeto de parceiro e se o status mudou
  IF NEW.partner_hash IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Inserir na fila de webhook para mudança de status
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
        'email', 'placeholder@email.com', -- Atualizar quando tiver campo email
        'telefone', COALESCE(NEW.telefone, 'Não informado'),
        'cnpj', NEW.cnpj,
        'hash', NEW.partner_hash,
        'data_status', now(),
        'domain', NEW.domain
      ),
      'pending'
    );
  END IF;
  
  -- Verificar se é um projeto de parceiro e se o domínio mudou
  IF NEW.partner_hash IS NOT NULL AND OLD.domain IS DISTINCT FROM NEW.domain THEN
    -- Inserir na fila de webhook para mudança de domínio
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
$$ LANGUAGE plpgsql;
