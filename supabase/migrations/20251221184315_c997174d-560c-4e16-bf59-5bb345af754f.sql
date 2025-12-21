-- Create invoices table for billing
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT 'FT',
  nif_cliente TEXT,
  client_name TEXT NOT NULL,
  client_address TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice series table
CREATE TABLE public.invoice_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  series_code TEXT NOT NULL,
  series_name TEXT NOT NULL,
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix TEXT,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_code, year)
);

-- Create SAF-T submissions table
CREATE TABLE public.saft_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account transactions table (conta corrente)
CREATE TABLE public.account_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guidebooks table
CREATE TABLE public.guidebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  welcome_message TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  primary_color TEXT DEFAULT '#1a7a6e',
  is_published BOOLEAN NOT NULL DEFAULT false,
  languages JSONB NOT NULL DEFAULT '["pt", "en"]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guidebook sections table
CREATE TABLE public.guidebook_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create upsell items table
CREATE TABLE public.guidebook_upsells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,
  name JSONB NOT NULL DEFAULT '{}',
  description JSONB NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create upsell orders table
CREATE TABLE public.upsell_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guidebook_id UUID NOT NULL REFERENCES public.guidebooks(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saft_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidebook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidebook_upsells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON public.invoices
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for invoice_series
CREATE POLICY "Users can view their own series" ON public.invoice_series
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own series" ON public.invoice_series
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own series" ON public.invoice_series
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for saft_submissions
CREATE POLICY "Users can view their own SAFT submissions" ON public.saft_submissions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own SAFT submissions" ON public.saft_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own SAFT submissions" ON public.saft_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for account_transactions
CREATE POLICY "Users can view their own transactions" ON public.account_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.account_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for guidebooks (property owners)
CREATE POLICY "Users can view guidebooks for their properties" ON public.guidebooks
  FOR SELECT USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));
CREATE POLICY "Users can create guidebooks for their properties" ON public.guidebooks
  FOR INSERT WITH CHECK (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));
CREATE POLICY "Users can update guidebooks for their properties" ON public.guidebooks
  FOR UPDATE USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete guidebooks for their properties" ON public.guidebooks
  FOR DELETE USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- RLS policies for guidebook_sections
CREATE POLICY "Users can manage sections for their guidebooks" ON public.guidebook_sections
  FOR ALL USING (guidebook_id IN (SELECT id FROM public.guidebooks WHERE property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())));

-- RLS policies for guidebook_upsells
CREATE POLICY "Users can manage upsells for their guidebooks" ON public.guidebook_upsells
  FOR ALL USING (guidebook_id IN (SELECT id FROM public.guidebooks WHERE property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())));

-- RLS policies for upsell_orders
CREATE POLICY "Users can view orders for their guidebooks" ON public.upsell_orders
  FOR SELECT USING (guidebook_id IN (SELECT id FROM public.guidebooks WHERE property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())));
CREATE POLICY "Anyone can create upsell orders" ON public.upsell_orders
  FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoice_series_updated_at BEFORE UPDATE ON public.invoice_series
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saft_submissions_updated_at BEFORE UPDATE ON public.saft_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guidebooks_updated_at BEFORE UPDATE ON public.guidebooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guidebook_sections_updated_at BEFORE UPDATE ON public.guidebook_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guidebook_upsells_updated_at BEFORE UPDATE ON public.guidebook_upsells
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_upsell_orders_updated_at BEFORE UPDATE ON public.upsell_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();