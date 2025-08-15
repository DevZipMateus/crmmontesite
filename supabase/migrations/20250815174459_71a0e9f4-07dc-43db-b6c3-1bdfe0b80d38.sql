-- Marcar projetos como inadimplentes com base nos IDs de Blaster fornecidos
UPDATE public.projects
SET is_inadimplente = TRUE,
    updated_at = now()
WHERE public.extract_blaster_id(blaster_link) IN ('394709','397011','377909','405908');