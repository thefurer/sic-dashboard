-- Allow admins to upload files to any user's folder
DROP POLICY IF EXISTS "Users can upload evidence" ON storage.objects;

CREATE POLICY "Users can upload evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'evaluation-evidence' AND 
  (
    -- User uploading to their own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admin can upload to any folder
    has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Allow admins to update files in any user's folder
DROP POLICY IF EXISTS "Users can update their evidence" ON storage.objects;

CREATE POLICY "Users can update their evidence"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'evaluation-evidence' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    has_role(auth.uid(), 'admin'::app_role)
  )
);