-- Add iCal URL fields to direct_booking_pages
ALTER TABLE public.direct_booking_pages 
ADD COLUMN IF NOT EXISTS ical_airbnb_url TEXT,
ADD COLUMN IF NOT EXISTS ical_booking_url TEXT,
ADD COLUMN IF NOT EXISTS ical_last_sync TIMESTAMP WITH TIME ZONE;

-- Create table for external calendar blocked dates
CREATE TABLE IF NOT EXISTS public.external_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.direct_booking_pages(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'airbnb' or 'booking'
  external_id TEXT, -- UID from iCal
  summary TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_id, external_id, source)
);

-- Enable RLS
ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy for owners to manage their events
CREATE POLICY "Users can manage external events for their pages"
ON public.external_calendar_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.direct_booking_pages dbp
    JOIN public.properties p ON dbp.property_id = p.id
    WHERE dbp.id = external_calendar_events.page_id
    AND p.user_id = auth.uid()
  )
);

-- Policy for public to view events (for availability checking)
CREATE POLICY "Public can view external events for published pages"
ON public.external_calendar_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.direct_booking_pages dbp
    JOIN public.properties p ON dbp.property_id = p.id
    JOIN public.profiles pr ON p.user_id = pr.id
    WHERE dbp.id = external_calendar_events.page_id
    AND dbp.is_published = true
    AND pr.subscription_plan = 'Premium'
  )
);

-- Create index for faster queries
CREATE INDEX idx_external_calendar_events_page_dates ON public.external_calendar_events(page_id, start_date, end_date);