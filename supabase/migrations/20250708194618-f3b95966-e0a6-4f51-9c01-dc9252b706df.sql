-- Criar tabela para landing pages dos vendedores
CREATE TABLE public.sales_landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Informações Pessoais
  nome_completo TEXT NOT NULL,
  email_profissional TEXT NOT NULL,
  telefone_whatsapp TEXT NOT NULL,
  foto_profissional_url TEXT,
  
  -- Perfil Profissional
  area_atuacao TEXT NOT NULL,
  cidade_regiao TEXT,
  mini_bio TEXT NOT NULL,
  slogan TEXT,
  redes_sociais TEXT,
  
  -- Ofertas e Benefícios
  principais_servicos TEXT NOT NULL,
  diferenciais TEXT,
  
  -- Estilo da Página
  cores_preferidas TEXT,
  estilo_visual TEXT,
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'novo',
  comando_gerado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sales_landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (form submission)
CREATE POLICY "Allow public insert on sales_landing_pages" 
ON public.sales_landing_pages 
FOR INSERT 
WITH CHECK (true);

-- Create policies for admin access (management)
CREATE POLICY "Allow admin select on sales_landing_pages" 
ON public.sales_landing_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin update on sales_landing_pages" 
ON public.sales_landing_pages 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow admin delete on sales_landing_pages" 
ON public.sales_landing_pages 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_landing_pages_updated_at
BEFORE UPDATE ON public.sales_landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for vendor photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendedor-fotos', 'vendedor-fotos', true);

-- Create storage policies for vendor photos
CREATE POLICY "Allow public upload vendor photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'vendedor-fotos');

CREATE POLICY "Allow public view vendor photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'vendedor-fotos');

CREATE POLICY "Allow admin manage vendor photos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'vendedor-fotos');