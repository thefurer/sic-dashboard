-- Create a separate table for sensitive contact info (email/phone)
CREATE TABLE IF NOT EXISTS public.profile_contacts (
  user_id uuid PRIMARY KEY,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profile_contacts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.profile_contacts ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own contact info" ON public.profile_contacts;
CREATE POLICY "Users can view their own contact info"
ON public.profile_contacts
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own contact info" ON public.profile_contacts;
CREATE POLICY "Users can upsert their own contact info"
ON public.profile_contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contact info" ON public.profile_contacts;
CREATE POLICY "Users can update their own contact info"
ON public.profile_contacts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all contact info" ON public.profile_contacts;
CREATE POLICY "Admins can manage all contact info"
ON public.profile_contacts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Keep updated_at current
DROP TRIGGER IF EXISTS update_profile_contacts_updated_at ON public.profile_contacts;
CREATE TRIGGER update_profile_contacts_updated_at
BEFORE UPDATE ON public.profile_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill from profiles (if columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email'
  ) OR EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'phone'
  ) THEN

    INSERT INTO public.profile_contacts (user_id, email, phone)
    SELECT id,
           CASE WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='email'
           ) THEN email ELSE NULL END,
           CASE WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='phone'
           ) THEN phone ELSE NULL END
    FROM public.profiles
    ON CONFLICT (user_id) DO UPDATE
      SET email = EXCLUDED.email,
          phone = EXCLUDED.phone;

  END IF;
END $$;

-- Update handle_new_user to avoid storing email/phone in profiles and store them in profile_contacts instead
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, researcher_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'researcher_code'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profile_contacts (user_id, email, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        updated_at = now();

  RETURN NEW;
END;
$$;

-- Drop sensitive columns from profiles to prevent broad exposure (if they exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN email;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN phone;
  END IF;
END $$;