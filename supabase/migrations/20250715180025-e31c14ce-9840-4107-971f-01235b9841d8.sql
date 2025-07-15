
-- Criar tabela para agendamentos de leads
CREATE TABLE public.lead_agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Pendente',
  notification_sent BOOLEAN DEFAULT false,
  original_time TIMESTAMP WITH TIME ZONE,
  postponed_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'Usuário'
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.lead_agendamentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users on lead_agendamentos"
  ON public.lead_agendamentos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_lead_agendamentos_lead_id ON public.lead_agendamentos(lead_id);
CREATE INDEX idx_lead_agendamentos_data_agendamento ON public.lead_agendamentos(data_agendamento);
CREATE INDEX idx_lead_agendamentos_status ON public.lead_agendamentos(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_lead_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Não criar trigger de updated_at pois a tabela não tem coluna updated_at
-- Se necessário, pode ser adicionada posteriormente
