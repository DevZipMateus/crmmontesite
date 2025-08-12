-- Primeiro, vamos verificar as políticas RLS atuais para leads
-- e corrigir o problema de permissão

-- Dropar políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "leads_select_public" ON public.leads;
DROP POLICY IF EXISTS "leads_update_authenticated" ON public.leads;
DROP POLICY IF EXISTS "leads_select_authenticated" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_authenticated" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_authenticated" ON public.leads;

-- Criar novas políticas RLS mais permissivas para leads
-- Permitir leitura pública
CREATE POLICY "Allow public read access to leads" 
ON public.leads 
FOR SELECT 
USING (true);

-- Permitir todas as operações para usuários autenticados
CREATE POLICY "Allow authenticated users full access to leads" 
ON public.leads 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- IMPORTANTE: Permitir atualizações públicas (anônimas) para leads
-- Isso é necessário para o funcionamento do sistema atual
CREATE POLICY "Allow public update access to leads" 
ON public.leads 
FOR UPDATE 
USING (true)
WITH CHECK (true);