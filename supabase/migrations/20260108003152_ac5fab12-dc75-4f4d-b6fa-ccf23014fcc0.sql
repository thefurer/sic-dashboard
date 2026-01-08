-- Allow authenticated users to upload to project-docs folder in institutional-docs bucket
CREATE POLICY "Authenticated users can upload project docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'institutional-docs' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = 'project-docs'
);

-- Allow authenticated users to delete project docs they uploaded
CREATE POLICY "Authenticated users can delete project docs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'institutional-docs' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = 'project-docs'
);