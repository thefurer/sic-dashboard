
-- Create table for admin greetings to users
CREATE TABLE public.user_greetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_greetings ENABLE ROW LEVEL SECURITY;

-- Recipients can read their own greetings
CREATE POLICY "Users can view their own greetings"
ON public.user_greetings FOR SELECT
USING (auth.uid() = to_user_id);

-- Recipients can update (mark as read)
CREATE POLICY "Users can mark their greetings as read"
ON public.user_greetings FOR UPDATE
USING (auth.uid() = to_user_id)
WITH CHECK (auth.uid() = to_user_id);

-- Admins can insert greetings
CREATE POLICY "Admins can send greetings"
ON public.user_greetings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admins can view all greetings
CREATE POLICY "Admins can view all greetings"
ON public.user_greetings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Index for fast lookups
CREATE INDEX idx_user_greetings_to_user ON public.user_greetings(to_user_id, read_at);
