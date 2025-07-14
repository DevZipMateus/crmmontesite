
-- Criar tabela para gestão de leads pré-venda
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  link_blaster TEXT,
  data_ultimo_contato TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  link_chat TEXT,
  vendedor TEXT,
  situacao TEXT NOT NULL DEFAULT 'Em contato',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhorar performance
CREATE INDEX idx_leads_empresa ON public.leads(empresa);
CREATE INDEX idx_leads_vendedor ON public.leads(vendedor);
CREATE INDEX idx_leads_situacao ON public.leads(situacao);
CREATE INDEX idx_leads_data_contato ON public.leads(data_ultimo_contato);

-- Função para calcular dias sem resposta
CREATE OR REPLACE FUNCTION public.calcular_dias_sem_resposta(data_contato TIMESTAMP WITH TIME ZONE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT EXTRACT(DAY FROM now() - data_contato)::INTEGER;
$$;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" 
  ON public.leads 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Inserir dados do CSV como exemplo
INSERT INTO public.leads (empresa, nome_cliente, link_blaster, data_ultimo_contato, link_chat, vendedor, situacao) VALUES
('MAQSOLO FABRICAÇÃO', 'Marcelo', 'https://blaster.zipline.com.br/egestor/#415606', '2025-07-01', 'https://zipline.zipticket.com.br/painel/#823814', 'LILIAN', 'esta formulando o que vai por no formulario'),
('HFEadm', 'Debora', 'https://blaster.zipline.com.br/egestor/?#422492', '2025-06-30', 'https://zipline.zipticket.com.br/painel/#816631', '', 'chamada pela terceira vez e ainda sem resposta'),
('ESPAÇO VIVA BEM', 'Gabriela', 'https://blaster.zipline.com.br/egestor/?#422366', '2025-06-20', 'https://zipline.zipticket.com.br/painel/#816611', '', 'esta reorganizando a empresa e esta esperando para mandar as fotos e formulario apos a conclusao');
