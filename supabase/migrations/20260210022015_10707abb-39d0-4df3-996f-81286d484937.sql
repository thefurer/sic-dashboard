
-- Add cedula column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cedula text NULL;

-- Update handle_new_user to save cedula from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, researcher_code, cedula)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'researcher_code',
    NEW.raw_user_meta_data->>'cedula'
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
