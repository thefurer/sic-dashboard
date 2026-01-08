-- Allow authenticated users to update project documents
CREATE POLICY "Authenticated users can update project documents"
ON public.official_projects
FOR UPDATE
USING (true)
WITH CHECK (true);
