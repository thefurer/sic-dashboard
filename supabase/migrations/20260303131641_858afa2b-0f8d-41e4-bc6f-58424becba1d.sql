
-- Add investigation_role column for self-selected research investigation role
ALTER TABLE public.profiles ADD COLUMN investigation_role text NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.investigation_role IS 'Self-selected investigation role: Director de proyecto, Investigador principal, Investigador asociado, Investigador, Estudiante';
