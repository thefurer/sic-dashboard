-- Add research_role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN research_role text;

-- Add comment to describe the column
COMMENT ON COLUMN public.profiles.research_role IS 'Academic role: Director de proyecto, Investigador principal, Investigador asociado, Investigador, Estudiante Investigador, Personal técnico';

-- Add project_document_url to official_projects table
ALTER TABLE public.official_projects 
ADD COLUMN project_document_url text;

-- Add comment
COMMENT ON COLUMN public.official_projects.project_document_url IS 'URL to project document (PDF) stored in Supabase storage';

-- Update planning_sheets meeting_schedule to support JSONB array of dates
-- First rename the existing column
ALTER TABLE public.planning_sheets 
RENAME COLUMN meeting_schedule TO meeting_schedule_old;

-- Add new JSONB column for multiple dates
ALTER TABLE public.planning_sheets 
ADD COLUMN meeting_schedule jsonb DEFAULT '[]'::jsonb;

-- Migrate existing text data to array (wrap in array)
UPDATE public.planning_sheets 
SET meeting_schedule = jsonb_build_array(meeting_schedule_old)
WHERE meeting_schedule_old IS NOT NULL;

-- Drop old column
ALTER TABLE public.planning_sheets 
DROP COLUMN meeting_schedule_old;

-- Add comment
COMMENT ON COLUMN public.planning_sheets.meeting_schedule IS 'Array of meeting dates in ISO format';