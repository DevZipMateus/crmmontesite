DROP TRIGGER IF EXISTS trg_sync_project_status_to_lead ON public.projects;
DROP TRIGGER IF EXISTS trg_sync_lead_status_to_project ON public.leads;

CREATE TRIGGER trg_sync_project_status_to_lead
AFTER INSERT OR UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.sync_lead_project_status();

CREATE TRIGGER trg_sync_lead_status_to_project
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.sync_lead_project_status();