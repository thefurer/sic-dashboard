-- Add new columns to app_settings for expanded institutional content
ALTER TABLE app_settings
ADD COLUMN objectives_text text DEFAULT 'Promover la investigación científica y tecnológica que contribuya al desarrollo sostenible de la región y del país, mediante la generación de conocimiento innovador y la formación de investigadores competentes.',
ADD COLUMN registry_pdf_url text,
ADD COLUMN instructions_pdf_url text,
ADD COLUMN work_plan_pdf_url text,
ADD COLUMN research_lines jsonb DEFAULT '[
  "Salud pública",
  "Educación en Ciencias de la Salud",
  "Educación y comunicación para el desarrollo humano y social",
  "Sistema integrado de producción e inocuidad agropecuaria y Agro silvícola",
  "Biotecnología y mejoramiento genético",
  "Ambiente y Biodiversidad",
  "Turismo consciente",
  "Silvicultura",
  "Emprendimiento, innovación y Desarrollo local sostenible",
  "Manejo de cuencas hidrográficas",
  "Planeamiento estratégico y dirección de organizaciones productivas y empresa",
  "Procesos administrativos y control contable en las organizaciones públicas y privadas",
  "Recursos hídricos y obras de saneamiento ambiental",
  "Estructuras e ingeniería de materiales",
  "Infraestructura del transporte, tránsito y seguridad vial",
  "Tecnología de la información e innovación aplicado al desarrollo social, empresarial y al entorno natural",
  "Cambio climático"
]'::jsonb;