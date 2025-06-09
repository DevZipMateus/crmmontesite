
-- Adicionar campos para melhor gerenciamento de tokens na tabela partners
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS token_hash text,
ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone;

-- Criar tabela para logs de autenticação
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  token_used text,
  request_ip text,
  request_headers jsonb,
  success boolean NOT NULL,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS para logs de autenticação
CREATE POLICY "Allow all operations on auth_logs" 
ON public.auth_logs 
FOR ALL 
USING (true);

-- Atualizar função de updated_at para a nova tabela
CREATE TRIGGER update_auth_logs_updated_at
  BEFORE UPDATE ON public.auth_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Criar função para validar token de autenticação
CREATE OR REPLACE FUNCTION public.validate_auth_token(token_input text)
RETURNS TABLE (
  partner_id uuid,
  partner_name text,
  is_valid boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  partner_record RECORD;
  token_hash_input text;
BEGIN
  -- Hash do token de entrada para comparação
  token_hash_input := encode(digest(token_input, 'sha256'), 'hex');
  
  -- Buscar parceiro com token correspondente
  SELECT p.id, p.name, p.active, p.token_expires_at
  INTO partner_record
  FROM public.partners p
  WHERE p.token_hash = token_hash_input
    AND p.active = true;
    
  -- Verificar se encontrou o parceiro e se o token não expirou
  IF partner_record.id IS NOT NULL THEN
    IF partner_record.token_expires_at IS NULL OR partner_record.token_expires_at > now() THEN
      -- Token válido - atualizar último uso
      UPDATE public.partners 
      SET last_used_at = now()
      WHERE id = partner_record.id;
      
      RETURN QUERY SELECT 
        partner_record.id,
        partner_record.name,
        true;
    ELSE
      -- Token expirado
      RETURN QUERY SELECT 
        partner_record.id,
        partner_record.name,
        false;
    END IF;
  ELSE
    -- Token não encontrado
    RETURN QUERY SELECT 
      NULL::uuid,
      NULL::text,
      false;
  END IF;
END;
$$;
