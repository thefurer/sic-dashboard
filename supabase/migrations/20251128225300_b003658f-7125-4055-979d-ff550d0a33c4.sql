-- Update RLS policies to allow editing of submitted evaluations
-- This enables users to make corrections even after submission

-- Drop existing policies for evaluation_items
DROP POLICY IF EXISTS "Users can insert items for their reports" ON public.evaluation_items;
DROP POLICY IF EXISTS "Users can update items for their reports" ON public.evaluation_items;
DROP POLICY IF EXISTS "Users can delete items from their reports" ON public.evaluation_items;

-- Drop existing policy for evaluation_reports
DROP POLICY IF EXISTS "Users can update their own reports" ON public.evaluation_reports;

-- Recreate policies with 'submitted' status included
CREATE POLICY "Users can insert items for their reports"
ON public.evaluation_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'observado', 'submitted')
  )
);

CREATE POLICY "Users can update items for their reports"
ON public.evaluation_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'observado', 'submitted')
  )
);

CREATE POLICY "Users can delete items from their reports"
ON public.evaluation_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM evaluation_reports
    WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status IN ('draft', 'observado', 'submitted')
  )
);

CREATE POLICY "Users can update their own reports"
ON public.evaluation_reports
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status IN ('draft', 'observado', 'submitted')
)
WITH CHECK (auth.uid() = user_id);