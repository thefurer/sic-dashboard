-- Add ORCID and country_code fields to profiles
ALTER TABLE public.profiles
ADD COLUMN orcid TEXT,
ADD COLUMN country_code TEXT DEFAULT 'EC';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.orcid IS 'ORCID identifier (e.g., 0000-0002-7793-9871)';
COMMENT ON COLUMN public.profiles.country_code IS 'ISO country code (EC for Ecuador, CO for Colombia)';