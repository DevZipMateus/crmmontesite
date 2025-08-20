-- Atualizar status de 'Em Customização' para 'Recebido'
UPDATE public.projects 
SET status = 'Recebido', updated_at = now()
WHERE status = 'Em Customização';