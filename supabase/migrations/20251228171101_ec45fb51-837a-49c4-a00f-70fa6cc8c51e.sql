-- Insert admin role for existing users with "Director de proyecto" research_role
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM public.profiles p
WHERE p.research_role = 'Director de proyecto'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.role = 'admin'
  );

-- Create a function to sync admin role based on research_role
CREATE OR REPLACE FUNCTION public.sync_director_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If research_role is set to "Director de proyecto", add admin role
  IF NEW.research_role = 'Director de proyecto' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  -- If research_role was "Director de proyecto" but changed to something else, remove admin role
  ELSIF OLD.research_role = 'Director de proyecto' AND (NEW.research_role IS NULL OR NEW.research_role != 'Director de proyecto') THEN
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically sync admin role when research_role changes
CREATE TRIGGER on_research_role_change
  AFTER UPDATE OF research_role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_director_admin_role();