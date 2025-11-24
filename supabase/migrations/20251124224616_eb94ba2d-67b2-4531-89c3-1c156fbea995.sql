-- Create fiscal_tasks table to store fiscal calendar tasks
CREATE TABLE public.fiscal_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prazo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('faturacao', 'iva', 'taxa_turistica', 'ine', 'outros')),
  concluida BOOLEAN NOT NULL DEFAULT false,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fiscal_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view fiscal tasks for their properties"
ON public.fiscal_tasks
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM properties
  WHERE properties.id = fiscal_tasks.property_id
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can insert fiscal tasks for their properties"
ON public.fiscal_tasks
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM properties
  WHERE properties.id = fiscal_tasks.property_id
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can update fiscal tasks for their properties"
ON public.fiscal_tasks
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM properties
  WHERE properties.id = fiscal_tasks.property_id
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can delete fiscal tasks for their properties"
ON public.fiscal_tasks
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM properties
  WHERE properties.id = fiscal_tasks.property_id
  AND properties.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_fiscal_tasks_updated_at
BEFORE UPDATE ON public.fiscal_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();