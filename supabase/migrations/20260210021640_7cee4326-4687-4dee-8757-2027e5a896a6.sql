
-- Create a security definer function to check plan membership
CREATE OR REPLACE FUNCTION public.is_plan_member(_user_id uuid, _plan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.planning_members
    WHERE profile_id = _user_id
      AND plan_id = _plan_id
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Members can view planning members" ON public.planning_members;

-- Recreate using the security definer function
CREATE POLICY "Members can view planning members"
ON public.planning_members
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR public.is_plan_member(auth.uid(), plan_id)
  OR EXISTS (
    SELECT 1 FROM planning_sheets ps
    WHERE ps.id = planning_members.plan_id AND ps.created_by = auth.uid()
  )
);
