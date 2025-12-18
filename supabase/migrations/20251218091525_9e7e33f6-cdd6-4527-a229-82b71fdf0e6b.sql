-- Create table for dynamic pricing
CREATE TABLE public.dynamic_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.direct_booking_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_night NUMERIC NOT NULL,
  min_nights INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dynamic_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view pricing for their own pages
CREATE POLICY "Users can view own pricing"
ON public.dynamic_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM direct_booking_pages dbp
    JOIN properties p ON dbp.property_id = p.id
    WHERE dbp.id = dynamic_pricing.page_id AND p.user_id = auth.uid()
  )
);

-- Policy: Users can insert pricing for their own pages
CREATE POLICY "Users can insert own pricing"
ON public.dynamic_pricing
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM direct_booking_pages dbp
    JOIN properties p ON dbp.property_id = p.id
    WHERE dbp.id = dynamic_pricing.page_id AND p.user_id = auth.uid()
  )
);

-- Policy: Users can update pricing for their own pages
CREATE POLICY "Users can update own pricing"
ON public.dynamic_pricing
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM direct_booking_pages dbp
    JOIN properties p ON dbp.property_id = p.id
    WHERE dbp.id = dynamic_pricing.page_id AND p.user_id = auth.uid()
  )
);

-- Policy: Users can delete pricing for their own pages
CREATE POLICY "Users can delete own pricing"
ON public.dynamic_pricing
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM direct_booking_pages dbp
    JOIN properties p ON dbp.property_id = p.id
    WHERE dbp.id = dynamic_pricing.page_id AND p.user_id = auth.uid()
  )
);

-- Policy: Public can view pricing for published pages
CREATE POLICY "Public can view published pricing"
ON public.dynamic_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM direct_booking_pages dbp
    JOIN properties p ON dbp.property_id = p.id
    JOIN profiles pr ON p.user_id = pr.id
    WHERE dbp.id = dynamic_pricing.page_id 
    AND dbp.is_published = true
    AND pr.subscription_plan = 'premium'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_dynamic_pricing_updated_at
BEFORE UPDATE ON public.dynamic_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();