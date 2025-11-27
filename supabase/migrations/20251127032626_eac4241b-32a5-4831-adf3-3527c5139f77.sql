-- Create app_settings table for institutional PDF configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL DEFAULT 'UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ',
  header_logo_left text,
  header_logo_right text,
  header_subtext text DEFAULT 'Creada mediante ley publicada en el Registro Oficial Nº261 del 7 de febrero del año 2001',
  faculty_name text DEFAULT 'FACULTAD DE CIENCIAS TÉCNICAS',
  career_name text DEFAULT 'CARRERA DE TECNOLOGÍAS DE LA INFORMACIÓN',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can view settings"
  ON public.app_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON public.app_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON public.app_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings row
INSERT INTO public.app_settings (institution_name, header_subtext, faculty_name, career_name)
VALUES (
  'UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ',
  'Creada mediante ley publicada en el Registro Oficial Nº261 del 7 de febrero del año 2001',
  'FACULTAD DE CIENCIAS TÉCNICAS',
  'CARRERA DE TECNOLOGÍAS DE LA INFORMACIÓN'
);