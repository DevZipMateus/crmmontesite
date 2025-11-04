-- Adicionar coluna form_hash na tabela leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS form_hash text UNIQUE;

-- Criar índice para otimizar buscas por form_hash
CREATE INDEX IF NOT EXISTS idx_leads_form_hash ON leads(form_hash);

-- Função para gerar hash automaticamente em novos leads
CREATE OR REPLACE FUNCTION generate_lead_form_hash()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.form_hash IS NULL THEN
    NEW.form_hash = encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para gerar hash automaticamente em INSERT
DROP TRIGGER IF EXISTS trigger_generate_lead_form_hash ON leads;
CREATE TRIGGER trigger_generate_lead_form_hash
BEFORE INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION generate_lead_form_hash();

-- Gerar hashes para leads existentes que não possuem
UPDATE leads 
SET form_hash = encode(gen_random_bytes(16), 'hex')
WHERE form_hash IS NULL;