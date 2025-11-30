-- Add missing foreign key constraint for evaluation_reports.user_id -> profiles.id
ALTER TABLE evaluation_reports 
ADD CONSTRAINT evaluation_reports_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;