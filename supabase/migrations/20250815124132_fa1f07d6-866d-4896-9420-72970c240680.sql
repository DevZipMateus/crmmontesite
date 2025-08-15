-- Adicionar campos faltantes na tabela site_personalizacoes
ALTER TABLE public.site_personalizacoes 
ADD COLUMN horario_funcionamento text,
ADD COLUMN estilo_visual text;