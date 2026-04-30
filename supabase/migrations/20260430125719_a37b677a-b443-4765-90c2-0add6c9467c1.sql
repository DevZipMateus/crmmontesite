-- Limpa rascunhos de formulário de lead com mais de 30 dias para liberar espaço.
DELETE FROM public.lead_form_drafts
WHERE updated_at < now() - interval '30 days';