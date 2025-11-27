-- Create official_projects table for admin to manage project list
CREATE TABLE IF NOT EXISTS public.official_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.official_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for official_projects
CREATE POLICY "Anyone can view official projects"
  ON public.official_projects
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage official projects"
  ON public.official_projects
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add new columns to evaluation_items table for enhanced metadata
ALTER TABLE public.evaluation_items
ADD COLUMN IF NOT EXISTS related_project_id UUID REFERENCES public.official_projects(id),
ADD COLUMN IF NOT EXISTS proposal_type TEXT,
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS project_roles JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS article_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS evidence_details JSONB DEFAULT '[]'::jsonb;