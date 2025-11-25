-- Create tasks table for admin to assign tasks to users
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks assigned to them or created by them
CREATE POLICY "Users can view their tasks"
ON public.tasks
FOR SELECT
USING (
  auth.uid() = assigned_to OR 
  auth.uid() = created_by OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can create tasks
CREATE POLICY "Admins can create tasks"
ON public.tasks
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins and task creators can update tasks
CREATE POLICY "Admins and creators can update tasks"
ON public.tasks
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = created_by
);

-- Admins and task creators can delete tasks
CREATE POLICY "Admins and creators can delete tasks"
ON public.tasks
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = created_by
);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();