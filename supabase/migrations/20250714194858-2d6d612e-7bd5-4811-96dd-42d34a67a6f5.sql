
-- Padronizar as situações dos leads existentes
UPDATE public.leads 
SET situacao = CASE 
  WHEN LOWER(situacao) LIKE '%pronto%' OR LOWER(situacao) LIKE '%finalizado%' OR LOWER(situacao) LIKE '%concluído%' THEN 'Site Pronto'
  WHEN LOWER(situacao) LIKE '%aguardando%' OR LOWER(situacao) LIKE '%esperando%' THEN 'Aguardando Resposta'
  WHEN LOWER(situacao) LIKE '%cancelou%' OR LOWER(situacao) LIKE '%cancelado%' THEN 'Cancelado'
  WHEN LOWER(situacao) LIKE '%formulando%' OR LOWER(situacao) LIKE '%preenchendo%' THEN 'Preenchendo Formulário'
  WHEN LOWER(situacao) LIKE '%montagem%' OR LOWER(situacao) LIKE '%desenvolvimento%' THEN 'Em Desenvolvimento'
  WHEN LOWER(situacao) LIKE '%sem resposta%' THEN 'Sem Resposta'
  WHEN LOWER(situacao) LIKE '%configurando%' THEN 'Configurando Domínio'
  ELSE 'Em Contato'
END;

-- Criar tabela para histórico de anotações dos leads
CREATE TABLE public.lead_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  nota TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT 'Sistema'
);

-- Adicionar índice para melhorar performance
CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX idx_lead_notes_created_at ON public.lead_notes(created_at DESC);

-- Habilitar RLS na tabela de notas
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users on lead_notes" 
  ON public.lead_notes 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Migrar observações existentes para a tabela de notas
INSERT INTO public.lead_notes (lead_id, nota, created_at, created_by)
SELECT id, observacoes, created_at, 'Migração'
FROM public.leads 
WHERE observacoes IS NOT NULL AND observacoes != '';
