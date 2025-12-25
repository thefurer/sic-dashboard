-- Fix RLS for users submitting evidence: allow changing status to 'submitted'
-- Previous policy used USING without WITH CHECK, so changing status caused "new row violates RLS".

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.assigned_tasks;

CREATE POLICY "Users can update their own tasks"
ON public.assigned_tasks
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status = ANY (ARRAY['pending'::text, 'observado'::text])
)
WITH CHECK (
  auth.uid() = user_id
);
