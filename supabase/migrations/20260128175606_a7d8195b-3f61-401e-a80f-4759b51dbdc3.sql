-- Add columns to track edited fields and update history
ALTER TABLE public.site_personalizacoes 
ADD COLUMN IF NOT EXISTS edited_fields text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_edited_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS edit_count integer DEFAULT 0;