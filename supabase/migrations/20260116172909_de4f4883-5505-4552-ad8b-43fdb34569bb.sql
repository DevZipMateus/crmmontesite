-- Add email field to delivery_terms table
ALTER TABLE public.delivery_terms 
ADD COLUMN email TEXT;