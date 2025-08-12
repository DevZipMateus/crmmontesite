
-- Habilitar RLS (por segurança/idempotência)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permitir DELETE público em leads
DROP POLICY IF EXISTS "Allow public delete access to leads" ON public.leads;

CREATE POLICY "Allow public delete access to leads"
ON public.leads
FOR DELETE
USING (true);
