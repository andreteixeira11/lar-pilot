-- Add access credentials table for properties
CREATE TABLE IF NOT EXISTS public.property_access_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  platform text NOT NULL,
  credentials jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_access_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view credentials for their properties"
ON public.property_access_credentials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_access_credentials.property_id
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert credentials for their properties"
ON public.property_access_credentials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_access_credentials.property_id
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update credentials for their properties"
ON public.property_access_credentials FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_access_credentials.property_id
    AND properties.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete credentials for their properties"
ON public.property_access_credentials FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_access_credentials.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_property_access_credentials_updated_at
BEFORE UPDATE ON public.property_access_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();