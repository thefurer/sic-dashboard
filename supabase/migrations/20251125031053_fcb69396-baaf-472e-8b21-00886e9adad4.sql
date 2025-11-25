-- Add cv_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN cv_url TEXT;

-- Create storage buckets for avatars and CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for CVs bucket
CREATE POLICY "Users can view their own CV"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all CVs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can upload their own CV"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own CV"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own CV"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add delete policy for profiles (admins only)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));