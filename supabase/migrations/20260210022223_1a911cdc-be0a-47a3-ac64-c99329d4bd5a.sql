
-- Create a security definer function to check if user has assigned tasks in a plan
CREATE OR REPLACE FUNCTION public.has_assigned_task_in_plan(_user_id uuid, _plan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.assigned_tasks at
    JOIN public.planning_activities pa ON pa.id = at.activity_id
    WHERE pa.plan_id = _plan_id AND at.user_id = _user_id
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Members can view planning sheets" ON public.planning_sheets;

-- Recreate without recursive subquery
CREATE POLICY "Members can view planning sheets"
ON public.planning_sheets
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR created_by = auth.uid()
  OR public.is_plan_member(auth.uid(), id)
  OR public.has_assigned_task_in_plan(auth.uid(), id)
);

-- Also fix planning_activities SELECT policy which has same recursive pattern
DROP POLICY IF EXISTS "Members can view planning activities" ON public.planning_activities;

CREATE POLICY "Members can view planning activities"
ON public.planning_activities
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR public.is_plan_member(auth.uid(), plan_id)
  OR EXISTS (
    SELECT 1 FROM planning_sheets ps
    WHERE ps.id = planning_activities.plan_id AND ps.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM assigned_tasks at
    WHERE at.activity_id = planning_activities.id AND at.user_id = auth.uid()
  )
);
