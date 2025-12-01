-- Add signature_responsible_name to app_settings
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS signature_responsible_name text 
DEFAULT 'Ing. María González, MSc';

-- Create assigned_tasks table for task assignment workflow
CREATE TABLE IF NOT EXISTS assigned_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_id uuid NOT NULL REFERENCES planning_activities(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES planning_sheets(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'observado')),
  evidence_url text,
  evidence_description text,
  evidence_link text,
  submitted_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  admin_observations text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on assigned_tasks
ALTER TABLE assigned_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tasks
CREATE POLICY "Users can view their own tasks"
ON assigned_tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own pending or observado tasks
CREATE POLICY "Users can update their own tasks"
ON assigned_tasks
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'observado'));

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks"
ON assigned_tasks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all tasks (for approval/rejection)
CREATE POLICY "Admins can update all tasks"
ON assigned_tasks
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert tasks (when creating assignments)
CREATE POLICY "Admins can insert tasks"
ON assigned_tasks
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete tasks
CREATE POLICY "Admins can delete tasks"
ON assigned_tasks
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_assigned_tasks_updated_at
BEFORE UPDATE ON assigned_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();