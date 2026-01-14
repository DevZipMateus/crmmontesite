-- Criar tabela delivery_terms para armazenar os termos de aceite
CREATE TABLE public.delivery_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Pesquisa de Satisfação
  nota_atendimento INTEGER NOT NULL CHECK (nota_atendimento >= 0 AND nota_atendimento <= 10),
  comentarios TEXT,
  
  -- Dados de Identificação do Cliente
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  
  -- Controle
  data_aceite TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar campo de hash para gerar link único nos projetos
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS delivery_term_hash TEXT UNIQUE;

COMMENT ON COLUMN public.projects.delivery_term_hash IS 'Hash único para link do formulário de termo de entrega';

-- Criar índice para busca por project_id
CREATE INDEX idx_delivery_terms_project_id ON public.delivery_terms(project_id);

-- Habilitar RLS
ALTER TABLE public.delivery_terms ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (formulário público)
CREATE POLICY "Allow public insert on delivery_terms"
ON public.delivery_terms FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Política para permitir leitura por usuários autenticados (admin)
CREATE POLICY "Allow authenticated select on delivery_terms"
ON public.delivery_terms FOR SELECT TO authenticated
USING (true);

-- Política para permitir leitura pública (verificar se já existe)
CREATE POLICY "Allow public select on delivery_terms"
ON public.delivery_terms FOR SELECT TO anon
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_delivery_terms_updated_at
BEFORE UPDATE ON public.delivery_terms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();