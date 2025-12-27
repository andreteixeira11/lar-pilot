-- Create owners table (separate from the manager system)
CREATE TABLE public.property_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    commission_rate NUMERIC DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create owner documents table
CREATE TABLE public.owner_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create owner costs table (for manager to register costs)
CREATE TABLE public.owner_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    cost_type TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL,
    month TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create owner sessions table for separate auth
CREATE TABLE public.owner_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_sessions ENABLE ROW LEVEL SECURITY;

-- RLS for property_owners - managers can manage owners for their properties
CREATE POLICY "Managers can view owners of their properties"
ON public.property_owners FOR SELECT
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Managers can create owners for their properties"
ON public.property_owners FOR INSERT
WITH CHECK (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Managers can update owners of their properties"
ON public.property_owners FOR UPDATE
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

CREATE POLICY "Managers can delete owners of their properties"
ON public.property_owners FOR DELETE
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

-- RLS for owner_documents
CREATE POLICY "Managers can manage documents"
ON public.owner_documents FOR ALL
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

-- RLS for owner_costs
CREATE POLICY "Managers can manage costs"
ON public.owner_costs FOR ALL
USING (property_id IN (SELECT id FROM properties WHERE user_id = auth.uid()));

-- RLS for owner_sessions - allow public access for auth flow
CREATE POLICY "Allow session management"
ON public.owner_sessions FOR ALL
USING (true);

-- Create function to verify owner password
CREATE OR REPLACE FUNCTION public.verify_owner_login(p_email TEXT, p_password TEXT)
RETURNS TABLE(owner_id UUID, owner_name TEXT, property_id UUID, property_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.id,
        po.name,
        po.property_id,
        p.name
    FROM property_owners po
    JOIN properties p ON p.id = po.property_id
    WHERE po.email = p_email
    AND po.password_hash = crypt(p_password, po.password_hash);
END;
$$;

-- Create function to hash password on insert/update
CREATE OR REPLACE FUNCTION public.hash_owner_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password_hash <> OLD.password_hash) THEN
        NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER hash_owner_password_trigger
BEFORE INSERT OR UPDATE ON property_owners
FOR EACH ROW
EXECUTE FUNCTION hash_owner_password();

-- Create updated_at trigger for property_owners
CREATE TRIGGER update_property_owners_updated_at
BEFORE UPDATE ON property_owners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for owner_costs
CREATE TRIGGER update_owner_costs_updated_at
BEFORE UPDATE ON owner_costs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();