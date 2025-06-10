
-- Adicionar coluna telefone na tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS telefone text;

-- Comentário: A coluna telefone será obrigatória no nível da aplicação, 
-- mas manteremos como nullable no banco para compatibilidade com projetos existentes
