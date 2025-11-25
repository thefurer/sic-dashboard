-- Add new fields to evaluation_items table for recursos section
ALTER TABLE evaluation_items
ADD COLUMN IF NOT EXISTS monto numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS fase text,
ADD COLUMN IF NOT EXISTS porcentaje_ejecucion integer DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN evaluation_items.monto IS 'Monto económico del recurso';
COMMENT ON COLUMN evaluation_items.fase IS 'Fase del proyecto (Propuesta, Ejecución, Finalizado)';
COMMENT ON COLUMN evaluation_items.porcentaje_ejecucion IS 'Porcentaje de ejecución del proyecto (0-100)';