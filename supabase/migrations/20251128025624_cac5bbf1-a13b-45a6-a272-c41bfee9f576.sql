-- Add edit_justification column to evaluation_reports
ALTER TABLE evaluation_reports
ADD COLUMN IF NOT EXISTS edit_justification TEXT,
ADD COLUMN IF NOT EXISTS edited_after_submission BOOLEAN DEFAULT FALSE;