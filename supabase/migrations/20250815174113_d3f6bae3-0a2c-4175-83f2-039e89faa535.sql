-- Adicionar campo para marcar projetos como inadimplentes
ALTER TABLE public.projects 
ADD COLUMN is_inadimplente BOOLEAN DEFAULT FALSE;