-- Allow authenticated users to insert official projects
CREATE POLICY "Authenticated users can insert official projects"
ON public.official_projects
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete official projects
CREATE POLICY "Authenticated users can delete official projects"
ON public.official_projects
FOR DELETE
USING (auth.uid() IS NOT NULL);