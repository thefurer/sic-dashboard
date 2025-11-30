-- Fix RLS policies for evaluation_items to allow proper INSERT/UPDATE
-- Drop existing policies and recreate with correct logic

DROP POLICY IF EXISTS "Users can insert items for their reports" ON evaluation_items;
DROP POLICY IF EXISTS "Users can update items for their reports" ON evaluation_items;
DROP POLICY IF EXISTS "Users can delete items from their reports" ON evaluation_items;

-- Allow users to insert items for their own reports (draft, needs_correction, submitted)
CREATE POLICY "Users can insert items for their reports"
ON evaluation_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'needs_correction', 'submitted')
  )
);

-- Allow users to update items for their own reports (draft, needs_correction, submitted)
CREATE POLICY "Users can update items for their reports"
ON evaluation_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'needs_correction', 'submitted')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'needs_correction', 'submitted')
  )
);

-- Allow users to delete items from their own reports (draft, needs_correction, submitted)
CREATE POLICY "Users can delete items from their reports"
ON evaluation_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'needs_correction', 'submitted')
  )
);