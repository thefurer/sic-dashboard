-- Fix: Allow project owners to delete their projects
-- And add support for multiple investigators

-- 1. Update DELETE policy to allow project owners to delete
DROP POLICY IF EXISTS "Only admins can delete projects" ON public.projects;

CREATE POLICY "Admins and project owners can delete projects" 
ON public.projects 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR (investigator_id = auth.uid())
);

-- 2. Create table for multiple investigators per project
CREATE TABLE IF NOT EXISTS public.project_investigators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  investigator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(project_id, investigator_id)
);

-- 3. Enable RLS on project_investigators
ALTER TABLE public.project_investigators ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for project_investigators
CREATE POLICY "Anyone can view project investigators"
ON public.project_investigators
FOR SELECT
USING (true);

CREATE POLICY "Project owners and admins can add investigators"
ON public.project_investigators
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id 
    AND investigator_id = auth.uid()
  )
);

CREATE POLICY "Project owners and admins can remove investigators"
ON public.project_investigators
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id 
    AND investigator_id = auth.uid()
  )
);

-- 5. Migrate existing data: add current investigators to new table
INSERT INTO public.project_investigators (project_id, investigator_id)
SELECT id, investigator_id 
FROM public.projects
ON CONFLICT (project_id, investigator_id) DO NOTHING;