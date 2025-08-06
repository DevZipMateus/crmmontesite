-- Remove duplicate projects for OTICAS MAELU (keep the first one)
DELETE FROM projects 
WHERE id = 'cd2beefd-6f3c-44f5-aa3e-436a0107af01' 
AND client_name = 'OTICAS MAELU';

-- Add unique constraint to prevent duplicate projects for the same lead
CREATE UNIQUE INDEX idx_projects_unique_lead 
ON projects (lead_id) 
WHERE lead_id IS NOT NULL;

-- Add validation function to prevent duplicate client names from same source
CREATE OR REPLACE FUNCTION prevent_duplicate_projects()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's already a project with same lead_id
  IF NEW.lead_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM projects 
      WHERE lead_id = NEW.lead_id 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Já existe um projeto vinculado a este lead';
    END IF;
  END IF;
  
  -- Check for duplicate client names created within the same minute
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE lower(trim(client_name)) = lower(trim(NEW.client_name))
    AND created_at > now() - INTERVAL '1 minute'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Um projeto com este nome de cliente foi criado recentemente. Aguarde um momento antes de criar outro.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to prevent duplicates
CREATE TRIGGER prevent_duplicate_projects_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_projects();