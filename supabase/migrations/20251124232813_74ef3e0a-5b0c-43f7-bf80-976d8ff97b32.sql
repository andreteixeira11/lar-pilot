-- Create table for check-in form templates
CREATE TABLE public.checkin_form_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  include_estimated_arrival BOOLEAN NOT NULL DEFAULT true,
  include_special_requests BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checkin_form_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view templates for their properties"
ON public.checkin_form_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = checkin_form_templates.property_id
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert templates for their properties"
ON public.checkin_form_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = checkin_form_templates.property_id
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update templates for their properties"
ON public.checkin_form_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = checkin_form_templates.property_id
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete templates for their properties"
ON public.checkin_form_templates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = checkin_form_templates.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_checkin_form_templates_updated_at
BEFORE UPDATE ON public.checkin_form_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add template_id to reservations table to link reservations to templates
ALTER TABLE public.reservations ADD COLUMN template_id UUID REFERENCES public.checkin_form_templates(id) ON DELETE SET NULL;