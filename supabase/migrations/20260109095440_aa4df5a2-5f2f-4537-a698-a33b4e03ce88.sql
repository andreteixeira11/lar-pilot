-- Create table for blocked dates
CREATE TABLE public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, blocked_date)
);

-- Enable RLS
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view blocked dates for their properties"
ON public.blocked_dates
FOR SELECT
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
  OR
  property_id IN (
    SELECT property_id FROM public.property_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create blocked dates for their properties"
ON public.blocked_dates
FOR INSERT
WITH CHECK (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
  OR
  property_id IN (
    SELECT property_id FROM public.property_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete blocked dates for their properties"
ON public.blocked_dates
FOR DELETE
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
  OR
  property_id IN (
    SELECT property_id FROM public.property_members WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_blocked_dates_updated_at
BEFORE UPDATE ON public.blocked_dates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();