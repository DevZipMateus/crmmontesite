
-- Add assigned_programmer field to projects table
ALTER TABLE public.projects 
ADD COLUMN assigned_programmer text;

-- Add comment to describe the field
COMMENT ON COLUMN public.projects.assigned_programmer IS 'Programador responsável pelo projeto. Valores possíveis: "Mateus", "Davi", ou NULL';
