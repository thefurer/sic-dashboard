-- Add read_at column to track when user viewed the notification
ALTER TABLE public.assigned_tasks 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for faster queries on unread tasks
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_read_at ON public.assigned_tasks(read_at);

-- Add index for deadline reminder queries
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_status_activity ON public.assigned_tasks(status, activity_id);