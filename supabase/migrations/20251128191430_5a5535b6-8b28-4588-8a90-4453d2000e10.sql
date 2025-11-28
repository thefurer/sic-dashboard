-- Create news_posts table
CREATE TABLE public.news_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_posts
CREATE POLICY "Anyone can view active news"
ON public.news_posts
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert news"
ON public.news_posts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news"
ON public.news_posts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news"
ON public.news_posts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for news media
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-media', 'news-media', true);

-- Storage policies for news-media bucket
CREATE POLICY "Anyone can view news media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'news-media');

CREATE POLICY "Admins can upload news media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_news_posts_updated_at
BEFORE UPDATE ON public.news_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();