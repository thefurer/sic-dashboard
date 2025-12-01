-- Fix RLS policy for evaluation_reports to allow status changes from draft to submitted

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can update their own draft reports" ON evaluation_reports;

-- Create a new policy that allows users to update their own reports when they're in draft status
-- The USING clause checks the current state (must be draft and belong to user)
-- The WITH CHECK clause only verifies ownership, allowing status changes
CREATE POLICY "Users can update their own draft reports"
ON evaluation_reports
FOR UPDATE
USING (
  auth.uid() = user_id AND status = 'draft'
)
WITH CHECK (
  auth.uid() = user_id
);