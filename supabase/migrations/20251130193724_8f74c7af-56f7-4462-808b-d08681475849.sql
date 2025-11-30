-- Drop old status constraint and add new one with 'needs_correction'
ALTER TABLE evaluation_reports DROP CONSTRAINT IF EXISTS "evaluation_reports_status_check";

ALTER TABLE evaluation_reports ADD CONSTRAINT "evaluation_reports_status_check"
CHECK (status IN ('draft', 'submitted', 'approved', 'needs_correction'));