-- Create documents table for institutional content
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  file_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('Misión', 'Visión', 'Planificación')),
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Only admins can manage documents
CREATE POLICY "Admins can manage documents"
ON public.documents
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Everyone can view documents (for public landing page)
CREATE POLICY "Anyone can view documents"
ON public.documents
FOR SELECT
USING (true);

-- Create storage bucket for institutional documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('institutional-docs', 'institutional-docs', true);

-- Storage policies for institutional-docs bucket
CREATE POLICY "Admins can upload institutional docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'institutional-docs' 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update institutional docs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'institutional-docs' 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete institutional docs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'institutional-docs' 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view institutional docs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'institutional-docs');

-- Add is_approved column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_approved boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add phone and researcher_code columns to profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'researcher_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN researcher_code text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Add trigger for documents updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();