-- Insert superadmin role for the user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('76148b6d-fbaf-4b09-97bd-09bbff6b8973', 'superadmin');

-- Create a helper function to check superadmin
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR role = 'superadmin')
  )
$$;