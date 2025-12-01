-- Create evaluation_reports table
CREATE TABLE IF NOT EXISTS public.evaluation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  total_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE
);

-- Create evaluation_items table
CREATE TABLE IF NOT EXISTS public.evaluation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.evaluation_reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('A', 'B', 'C', 'D')),
  indicator_name TEXT NOT NULL,
  score_obtained DECIMAL(5,2) DEFAULT 0,
  evidence_url TEXT,
  quantity INTEGER DEFAULT 0,
  justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for evaluation evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluation-evidence', 'evaluation-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on evaluation_reports
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluation_reports
CREATE POLICY "Users can view their own reports"
  ON public.evaluation_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.evaluation_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft reports"
  ON public.evaluation_reports FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Admins can view all reports"
  ON public.evaluation_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update report status"
  ON public.evaluation_reports FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on evaluation_items
ALTER TABLE public.evaluation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluation_items
CREATE POLICY "Users can view their own items"
  ON public.evaluation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluation_reports
      WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items for their reports"
  ON public.evaluation_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.evaluation_reports
      WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status = 'draft'
    )
  );

CREATE POLICY "Users can update items for their draft reports"
  ON public.evaluation_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluation_reports
      WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status = 'draft'
    )
  );

CREATE POLICY "Users can delete items from their draft reports"
  ON public.evaluation_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluation_reports
      WHERE evaluation_reports.id = evaluation_items.report_id
      AND evaluation_reports.user_id = auth.uid()
      AND evaluation_reports.status = 'draft'
    )
  );

CREATE POLICY "Admins can view all items"
  ON public.evaluation_items FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for evaluation-evidence bucket
CREATE POLICY "Users can upload evaluation evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evaluation-evidence' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evaluation-evidence' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view evaluation evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'evaluation-evidence');

CREATE POLICY "Users can update their evidence"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'evaluation-evidence' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their evidence"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evaluation-evidence' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for updated_at on evaluation_reports
CREATE TRIGGER update_evaluation_reports_updated_at
  BEFORE UPDATE ON public.evaluation_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on evaluation_items
CREATE TRIGGER update_evaluation_items_updated_at
  BEFORE UPDATE ON public.evaluation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_evaluation_reports_user_id ON public.evaluation_reports(user_id);
CREATE INDEX idx_evaluation_reports_year ON public.evaluation_reports(year);
CREATE INDEX idx_evaluation_reports_status ON public.evaluation_reports(status);
CREATE INDEX idx_evaluation_items_report_id ON public.evaluation_items(report_id);
CREATE INDEX idx_evaluation_items_category ON public.evaluation_items(category);