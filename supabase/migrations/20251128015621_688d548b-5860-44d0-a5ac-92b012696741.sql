-- Add admin review columns to evaluation_reports
ALTER TABLE evaluation_reports 
ADD COLUMN IF NOT EXISTS admin_observations text,
ADD COLUMN IF NOT EXISTS correction_deadline date,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);