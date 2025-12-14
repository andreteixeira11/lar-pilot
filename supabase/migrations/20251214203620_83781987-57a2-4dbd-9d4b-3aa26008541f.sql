-- Create table for direct booking pages
CREATE TABLE public.direct_booking_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  description TEXT,
  price_per_night NUMERIC,
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER DEFAULT 30,
  cleaning_fee NUMERIC DEFAULT 0,
  check_in_time TEXT DEFAULT '15:00',
  check_out_time TEXT DEFAULT '11:00',
  house_rules TEXT,
  cancellation_policy TEXT,
  contact_form_enabled BOOLEAN DEFAULT true,
  payment_enabled BOOLEAN DEFAULT false,
  hero_image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(slug),
  UNIQUE(property_id)
);

-- Enable RLS
ALTER TABLE public.direct_booking_pages ENABLE ROW LEVEL SECURITY;

-- Create index for slug lookups
CREATE INDEX idx_direct_booking_pages_slug ON public.direct_booking_pages(slug);
CREATE INDEX idx_direct_booking_pages_property ON public.direct_booking_pages(property_id);

-- Policy: Users can view their own pages
CREATE POLICY "Users can view own direct booking pages"
ON public.direct_booking_pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = direct_booking_pages.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Policy: Only Premium users can insert pages
CREATE POLICY "Premium users can create direct booking pages"
ON public.direct_booking_pages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.id = direct_booking_pages.property_id
    AND p.user_id = auth.uid()
    AND pr.subscription_plan = 'premium'
  )
);

-- Policy: Only Premium users can update pages
CREATE POLICY "Premium users can update direct booking pages"
ON public.direct_booking_pages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.id = direct_booking_pages.property_id
    AND p.user_id = auth.uid()
    AND pr.subscription_plan = 'premium'
  )
);

-- Policy: Users can delete their own pages
CREATE POLICY "Users can delete own direct booking pages"
ON public.direct_booking_pages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = direct_booking_pages.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Policy: Public can view published pages (for public access)
CREATE POLICY "Public can view published pages"
ON public.direct_booking_pages
FOR SELECT
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.id = direct_booking_pages.property_id
    AND pr.subscription_plan = 'premium'
  )
);

-- Create table for direct booking requests
CREATE TABLE public.direct_booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.direct_booking_pages(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_booking_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Property owners can view requests for their pages
CREATE POLICY "Owners can view booking requests"
ON public.direct_booking_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.direct_booking_pages dbp
    JOIN public.properties p ON dbp.property_id = p.id
    WHERE dbp.id = direct_booking_requests.page_id
    AND p.user_id = auth.uid()
  )
);

-- Policy: Public can create booking requests
CREATE POLICY "Public can create booking requests"
ON public.direct_booking_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.direct_booking_pages dbp
    JOIN public.properties p ON dbp.property_id = p.id
    JOIN public.profiles pr ON p.user_id = pr.id
    WHERE dbp.id = direct_booking_requests.page_id
    AND dbp.is_published = true
    AND pr.subscription_plan = 'premium'
  )
);

-- Policy: Property owners can update request status
CREATE POLICY "Owners can update booking requests"
ON public.direct_booking_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.direct_booking_pages dbp
    JOIN public.properties p ON dbp.property_id = p.id
    WHERE dbp.id = direct_booking_requests.page_id
    AND p.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_direct_booking_pages_updated_at
  BEFORE UPDATE ON public.direct_booking_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_direct_booking_requests_updated_at
  BEFORE UPDATE ON public.direct_booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();