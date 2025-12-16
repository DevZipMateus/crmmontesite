-- Adicionar coluna project_link na tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_link TEXT;

COMMENT ON COLUMN public.projects.project_link IS 'Link do projeto no Lovable ou repositório GitHub';