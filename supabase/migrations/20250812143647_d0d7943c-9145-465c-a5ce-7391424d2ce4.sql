
-- Garantir que o RLS está habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (necessário para criação de leads sem login)
CREATE POLICY "Allow public insert access to leads"
ON public.leads
FOR INSERT
WITH CHECK (true);
