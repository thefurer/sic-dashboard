-- Add a JSONB column to store multiple document URLs
ALTER TABLE public.official_projects
ADD COLUMN documents jsonb DEFAULT '[]'::jsonb;

-- Migrate existing document URL to the new array format
UPDATE public.official_projects
SET documents = CASE 
  WHEN project_document_url IS NOT NULL AND project_document_url != '' 
  THEN jsonb_build_array(jsonb_build_object('url', project_document_url, 'name', 'Documento Principal', 'uploaded_at', now()))
  ELSE '[]'::jsonb
END;