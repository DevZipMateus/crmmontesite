-- Criar projetos para as personalizações órfãs identificadas
INSERT INTO public.projects (
  client_name,
  responsible_name,
  template,
  status,
  client_type,
  personalization_id,
  cnpj,
  telefone,
  created_at
)
SELECT 
  p.officenome as client_name,
  p.responsavelnome as responsible_name,
  COALESCE(p.modelo, 'Não especificado') as template,
  'Recebido' as status,
  'cliente_final' as client_type,
  p.id as personalization_id,
  NULL as cnpj,
  p.telefone,
  p.created_at
FROM public.site_personalizacoes p
LEFT JOIN public.projects proj ON proj.personalization_id = p.id
WHERE proj.id IS NULL 
  AND p.created_at >= now() - INTERVAL '72 hours'
  AND p.officenome IS NOT NULL;