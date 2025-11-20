-- Create table for scientific books
CREATE TABLE IF NOT EXISTS public.scientific_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  authors text NOT NULL,
  year text NOT NULL,
  isbn text NOT NULL,
  editorial text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.scientific_books ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view books"
ON public.scientific_books
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create books"
ON public.scientific_books
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
ON public.scientific_books
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and book owners can delete books"
ON public.scientific_books
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (user_id = auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_scientific_books_updated_at
BEFORE UPDATE ON public.scientific_books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();