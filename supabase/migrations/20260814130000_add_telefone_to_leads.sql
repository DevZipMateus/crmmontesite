-- Adiciona campo de número de contato (telefone) aos leads.
-- Mantido opcional no banco (nullable) porque leads também são criados
-- por integrações externas (ex: create-lead-from-fattura) que não coletam
-- telefone; a obrigatoriedade é aplicada no formulário de criação manual.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS telefone TEXT;
