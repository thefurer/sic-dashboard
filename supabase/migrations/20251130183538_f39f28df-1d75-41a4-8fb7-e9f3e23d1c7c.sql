-- Fix CASCADE DELETE for evaluation_items
ALTER TABLE evaluation_items 
DROP CONSTRAINT IF EXISTS evaluation_items_report_id_fkey,
ADD CONSTRAINT evaluation_items_report_id_fkey 
FOREIGN KEY (report_id) REFERENCES evaluation_reports(id) ON DELETE CASCADE;

-- Ensure Admins can DELETE evaluation_reports
DROP POLICY IF EXISTS "Admins can delete evaluation reports" ON evaluation_reports;
CREATE POLICY "Admins can delete evaluation reports"
ON evaluation_reports
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));