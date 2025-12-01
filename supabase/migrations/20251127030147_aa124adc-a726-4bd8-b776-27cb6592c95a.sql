-- Create planning_sheets table
CREATE TABLE public.planning_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_name TEXT NOT NULL,
  president_name TEXT NOT NULL DEFAULT 'Ing. Holger Delgado Lucas PhD',
  meeting_schedule TEXT NOT NULL DEFAULT 'Cada semana día miércoles',
  drive_link TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create planning_activities table
CREATE TABLE public.planning_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.planning_sheets(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  objective TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  verification_means TEXT NOT NULL,
  responsibles JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create planning_members table (junction table)
CREATE TABLE public.planning_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.planning_sheets(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_type TEXT NOT NULL, -- 'docente' or 'estudiante'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.planning_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for planning_sheets
CREATE POLICY "Admins can manage all planning sheets"
ON public.planning_sheets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view all planning sheets"
ON public.planning_sheets
FOR SELECT
USING (true);

-- RLS Policies for planning_activities
CREATE POLICY "Admins can manage all planning activities"
ON public.planning_activities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view all planning activities"
ON public.planning_activities
FOR SELECT
USING (true);

-- RLS Policies for planning_members
CREATE POLICY "Admins can manage planning members"
ON public.planning_members
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view planning members"
ON public.planning_members
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_planning_sheets_updated_at
BEFORE UPDATE ON public.planning_sheets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_planning_activities_plan_id ON public.planning_activities(plan_id);
CREATE INDEX idx_planning_members_plan_id ON public.planning_members(plan_id);
CREATE INDEX idx_planning_members_profile_id ON public.planning_members(profile_id);