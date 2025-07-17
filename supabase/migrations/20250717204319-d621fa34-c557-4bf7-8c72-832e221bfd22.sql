
-- Criar função para atualizar projetos de forma segura, evitando problemas com triggers
CREATE OR REPLACE FUNCTION public.update_project_safe(
  project_id uuid,
  update_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result_data jsonb;
  updated_project record;
BEGIN
  -- Temporariamente desabilitar o trigger que causa problema com campo "situacao"
  ALTER TABLE public.projects DISABLE TRIGGER IF EXISTS sync_lead_project_status_trigger;
  
  -- Fazer a atualização do projeto
  UPDATE public.projects 
  SET 
    client_name = COALESCE((update_data->>'client_name')::text, client_name),
    template = COALESCE((update_data->>'template')::text, template),
    status = COALESCE((update_data->>'status')::text, status),
    responsible_name = COALESCE((update_data->>'responsible_name')::text, responsible_name),
    domain = COALESCE((update_data->>'domain')::text, domain),
    client_type = COALESCE((update_data->>'client_type')::text, client_type),
    blaster_link = COALESCE((update_data->>'blaster_link')::text, blaster_link),
    partner_link = CASE 
      WHEN update_data->>'partner_link' = 'null' THEN NULL
      ELSE COALESCE((update_data->>'partner_link')::text, partner_link)
    END,
    provider_credentials = COALESCE((update_data->>'provider_credentials')::text, provider_credentials),
    updated_at = now()
  WHERE id = project_id
  RETURNING *;
  
  -- Obter o projeto atualizado
  SELECT * INTO updated_project FROM public.projects WHERE id = project_id;
  
  -- Reabilitar o trigger
  ALTER TABLE public.projects ENABLE TRIGGER IF EXISTS sync_lead_project_status_trigger;
  
  -- Converter o resultado para jsonb
  SELECT to_jsonb(updated_project) INTO result_data;
  
  RETURN result_data;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Garantir que o trigger seja reabilitado mesmo em caso de erro
    ALTER TABLE public.projects ENABLE TRIGGER IF EXISTS sync_lead_project_status_trigger;
    RAISE;
END;
$function$;
