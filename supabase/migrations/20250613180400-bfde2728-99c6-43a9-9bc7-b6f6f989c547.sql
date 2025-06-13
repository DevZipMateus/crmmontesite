
-- Add new columns to the projects table for tracking customization deadlines
ALTER TABLE public.projects 
ADD COLUMN site_ready_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN customization_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN requires_paid_customization BOOLEAN DEFAULT false;

-- Create a function to calculate business days (excluding weekends)
CREATE OR REPLACE FUNCTION public.add_business_days(start_date TIMESTAMP WITH TIME ZONE, days_to_add INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
    result_date TIMESTAMP WITH TIME ZONE := start_date;
    days_added INTEGER := 0;
    current_dow INTEGER;
BEGIN
    WHILE days_added < days_to_add LOOP
        result_date := result_date + INTERVAL '1 day';
        current_dow := EXTRACT(dow FROM result_date);
        
        -- Skip weekends (Saturday = 6, Sunday = 0)
        IF current_dow NOT IN (0, 6) THEN
            days_added := days_added + 1;
        END IF;
    END LOOP;
    
    RETURN result_date;
END;
$$;

-- Create a function to update customization deadline when project becomes ready
CREATE OR REPLACE FUNCTION public.update_customization_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if status changed to "Site pronto"
    IF NEW.status = 'Site pronto' AND (OLD.status IS NULL OR OLD.status != 'Site pronto') THEN
        NEW.site_ready_date = now();
        NEW.customization_deadline = public.add_business_days(now(), 7);
        NEW.requires_paid_customization = false;
    END IF;
    
    -- Check if deadline has passed
    IF NEW.customization_deadline IS NOT NULL AND now() > NEW.customization_deadline THEN
        NEW.requires_paid_customization = true;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update customization deadline
CREATE TRIGGER trigger_update_customization_deadline
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_customization_deadline();
