-- Fix 1: Restrict profiles table to authenticated users only (instead of public)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Authenticated users can view profiles"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict planning_activities to members, admins, and creators only
DROP POLICY IF EXISTS "Users can view all planning activities" ON planning_activities;

CREATE POLICY "Members can view planning activities"
ON planning_activities FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM planning_members pm
    WHERE pm.plan_id = planning_activities.plan_id
    AND pm.profile_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM planning_sheets ps
    WHERE ps.id = planning_activities.plan_id
    AND ps.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM assigned_tasks at
    WHERE at.activity_id = planning_activities.id
    AND at.user_id = auth.uid()
  )
);

-- Fix 3: Restrict planning_sheets to members, admins, and creators only  
DROP POLICY IF EXISTS "Users can view all planning sheets" ON planning_sheets;

CREATE POLICY "Members can view planning sheets"
ON planning_sheets FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM planning_members pm
    WHERE pm.plan_id = planning_sheets.id
    AND pm.profile_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM assigned_tasks at
    JOIN planning_activities pa ON pa.id = at.activity_id
    WHERE pa.plan_id = planning_sheets.id
    AND at.user_id = auth.uid()
  )
);

-- Fix 4: Restrict planning_members to admins and members of the same plan
DROP POLICY IF EXISTS "Users can view planning members" ON planning_members;

CREATE POLICY "Members can view planning members"
ON planning_members FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM planning_members pm2
    WHERE pm2.plan_id = planning_members.plan_id
    AND pm2.profile_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM planning_sheets ps
    WHERE ps.id = planning_members.plan_id
    AND ps.created_by = auth.uid()
  )
);