
-- Adicionar campo de arquivamento manual na tabela projects
ALTER TABLE public.projects 
ADD COLUMN manually_archived BOOLEAN DEFAULT false;

-- Comentário: Este campo permitirá arquivamento manual independente do controle de prazos
COMMENT ON COLUMN public.projects.manually_archived IS 'Permite arquivamento manual do projeto, independente do controle automático de prazos';
