-- Add media_urls column to sales_landing_pages table
ALTER TABLE public.sales_landing_pages 
ADD COLUMN media_urls TEXT;