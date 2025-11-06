-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  nif TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 4,
  bedrooms INTEGER DEFAULT 2,
  bathrooms INTEGER DEFAULT 1,
  check_in_time TEXT DEFAULT '15:00',
  check_out_time TEXT DEFAULT '11:00',
  wifi_password TEXT,
  parking_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  country_origin TEXT NOT NULL,
  num_guests INTEGER NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_nights INTEGER NOT NULL,
  total_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'pendente', 'cancelada')),
  booking_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tourist tax table
CREATE TABLE public.tourist_tax (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  total_guests INTEGER NOT NULL DEFAULT 0,
  total_nights INTEGER NOT NULL DEFAULT 0,
  tax_per_night DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  total_tax DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, month)
);

-- Create INE statistics table
CREATE TABLE public.ine_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  country TEXT NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 0,
  num_nights INTEGER NOT NULL DEFAULT 0,
  overnight_stays INTEGER NOT NULL DEFAULT 0,
  transit_nights INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, month, country)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('multibanco', 'mbway', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  multibanco_entity TEXT,
  multibanco_reference TEXT,
  mbway_phone TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourist_tax ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ine_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Users can view own properties" ON public.properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- Reservations policies
CREATE POLICY "Users can view reservations for their properties" ON public.reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = reservations.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reservations for their properties" ON public.reservations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = reservations.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reservations for their properties" ON public.reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = reservations.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reservations for their properties" ON public.reservations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = reservations.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Tourist tax policies
CREATE POLICY "Users can view tourist tax for their properties" ON public.tourist_tax
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tourist_tax.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tourist tax for their properties" ON public.tourist_tax
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tourist_tax.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tourist tax for their properties" ON public.tourist_tax
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tourist_tax.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- INE statistics policies
CREATE POLICY "Users can view INE stats for their properties" ON public.ine_statistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = ine_statistics.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert INE stats for their properties" ON public.ine_statistics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = ine_statistics.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tourist_tax_updated_at BEFORE UPDATE ON public.tourist_tax
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ine_statistics_updated_at BEFORE UPDATE ON public.ine_statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, nif)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'nif', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();