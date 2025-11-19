-- Update RLS policy to allow all authenticated users to create projects
-- This is more appropriate for a research management platform where all users can be investigators

DROP POLICY IF EXISTS "Admins and researchers can create projects" ON public.projects;

CREATE POLICY "Authenticated users can create projects" 
ON public.projects 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = investigator_id);
