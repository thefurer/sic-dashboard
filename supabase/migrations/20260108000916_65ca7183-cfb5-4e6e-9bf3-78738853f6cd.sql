-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can update project documents" ON public.official_projects;

-- Create a more restrictive policy that only allows authenticated users to update
CREATE POLICY "Authenticated users can update project documents"
ON public.official_projects
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
