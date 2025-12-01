-- Fix RLS policies for proper data isolation between users

-- Update evaluation_reports policies
DROP POLICY IF EXISTS "Users can view their own reports" ON evaluation_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON evaluation_reports;
DROP POLICY IF EXISTS "Users can update their own draft reports" ON evaluation_reports;

-- Users can only view their OWN reports
CREATE POLICY "Users can view their own reports"
ON evaluation_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view ALL reports
CREATE POLICY "Admins can view all reports"
ON evaluation_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users can update their own reports ONLY if draft or observado (needs correction)
CREATE POLICY "Users can update their own reports"
ON evaluation_reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('draft', 'observado'))
WITH CHECK (auth.uid() = user_id);

-- Update evaluation_items policies for proper isolation
DROP POLICY IF EXISTS "Users can view their own items" ON evaluation_items;
DROP POLICY IF EXISTS "Admins can view all items" ON evaluation_items;
DROP POLICY IF EXISTS "Users can insert items for their reports" ON evaluation_items;
DROP POLICY IF EXISTS "Users can update items for their draft reports" ON evaluation_items;
DROP POLICY IF EXISTS "Users can delete items from their draft reports" ON evaluation_items;

-- Users can only view items from their OWN reports
CREATE POLICY "Users can view their own items"
ON evaluation_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
    AND evaluation_reports.user_id = auth.uid()
  )
);

-- Admins can view ALL items
CREATE POLICY "Admins can view all items"
ON evaluation_items
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Users can insert items only for their own draft or observado reports
CREATE POLICY "Users can insert items for their reports"
ON evaluation_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
    AND evaluation_reports.user_id = auth.uid()
    AND evaluation_reports.status IN ('draft', 'observado')
  )
);

-- Users can update items only for their own draft or observado reports
CREATE POLICY "Users can update items for their reports"
ON evaluation_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
    AND evaluation_reports.user_id = auth.uid()
    AND evaluation_reports.status IN ('draft', 'observado')
  )
);

-- Users can delete items only from their own draft or observado reports
CREATE POLICY "Users can delete items from their reports"
ON evaluation_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
    AND evaluation_reports.user_id = auth.uid()
    AND evaluation_reports.status IN ('draft', 'observado')
  )
);