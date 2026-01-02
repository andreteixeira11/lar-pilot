-- Table for simulator leads (proposals from /simulador)
CREATE TABLE public.simulator_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Package info
  package_name TEXT NOT NULL,
  total_commission NUMERIC NOT NULL,
  selected_services JSONB DEFAULT '[]'::jsonb,
  
  -- Property info
  property_name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  address TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  capacity INTEGER,
  
  -- Owner info
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  notes TEXT,
  
  -- Lead status
  status TEXT NOT NULL DEFAULT 'new',
  contacted_at TIMESTAMP WITH TIME ZONE,
  contacted_by UUID,
  admin_notes TEXT
);

-- Table for site analytics (page views)
CREATE TABLE public.site_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  session_id TEXT,
  country TEXT,
  city TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.simulator_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for simulator_leads - only admins can view/manage
CREATE POLICY "Admins can view all leads"
ON public.simulator_leads
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update leads"
ON public.simulator_leads
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Anyone can insert leads"
ON public.simulator_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS policies for site_analytics - only admins can view, anyone can insert
CREATE POLICY "Admins can view analytics"
ON public.site_analytics
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Anyone can insert analytics"
ON public.site_analytics
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create trigger for updated_at on simulator_leads
CREATE TRIGGER update_simulator_leads_updated_at
BEFORE UPDATE ON public.simulator_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_simulator_leads_status ON public.simulator_leads(status);
CREATE INDEX idx_simulator_leads_created_at ON public.simulator_leads(created_at DESC);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at DESC);
CREATE INDEX idx_site_analytics_page_path ON public.site_analytics(page_path);