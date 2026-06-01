CREATE OR REPLACE FUNCTION public.sync_assigned_programmer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'Victor' THEN
      NEW.assigned_programmer := 'Victor';
    ELSIF NEW.status = 'Davi' THEN
      NEW.assigned_programmer := 'Davi';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_assigned_programmer ON public.projects;
CREATE TRIGGER trg_sync_assigned_programmer
BEFORE INSERT OR UPDATE OF status ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.sync_assigned_programmer();

-- Backfill existing projects
UPDATE public.projects SET assigned_programmer = 'Victor' WHERE status = 'Victor' AND (assigned_programmer IS NULL OR assigned_programmer <> 'Victor');
UPDATE public.projects SET assigned_programmer = 'Davi' WHERE status = 'Davi' AND (assigned_programmer IS NULL OR assigned_programmer <> 'Davi');
