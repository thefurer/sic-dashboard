-- Add signature configuration fields to app_settings table
ALTER TABLE public.app_settings
ADD COLUMN signature_president_name text DEFAULT 'Ing. Christian Caicedo Plúa, PhD',
ADD COLUMN signature_coordinator_name text DEFAULT 'Ing. Javier Marcillo Merino, Mg';