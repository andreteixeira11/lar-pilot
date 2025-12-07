-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create property_members table to associate users with properties
CREATE TABLE public.property_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (property_id, user_id)
);

-- Create workspace_invitations table for pending invitations
CREATE TABLE public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'viewer',
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add extra_users_count to profiles for billing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extra_users_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extra_users_cost NUMERIC DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is property owner
CREATE OR REPLACE FUNCTION public.is_property_owner(_property_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = _property_id
      AND user_id = _user_id
  )
$$;

-- Function to check if user is property member
CREATE OR REPLACE FUNCTION public.is_property_member(_property_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_members
    WHERE property_id = _property_id
      AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = _property_id
      AND user_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for property_members
CREATE POLICY "Property owners can view members"
ON public.property_members FOR SELECT
USING (public.is_property_owner(property_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Property owners can insert members"
ON public.property_members FOR INSERT
WITH CHECK (public.is_property_owner(property_id, auth.uid()));

CREATE POLICY "Property owners can update members"
ON public.property_members FOR UPDATE
USING (public.is_property_owner(property_id, auth.uid()));

CREATE POLICY "Property owners can delete members"
ON public.property_members FOR DELETE
USING (public.is_property_owner(property_id, auth.uid()));

-- RLS Policies for workspace_invitations
CREATE POLICY "Users can view invitations they sent or received"
ON public.workspace_invitations FOR SELECT
USING (invited_by = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Property owners can create invitations"
ON public.workspace_invitations FOR INSERT
WITH CHECK (public.is_property_owner(property_id, auth.uid()));

CREATE POLICY "Invitation creators can delete"
ON public.workspace_invitations FOR DELETE
USING (invited_by = auth.uid());

-- Update properties RLS to include members
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
CREATE POLICY "Users can view own or member properties"
ON public.properties FOR SELECT
USING (user_id = auth.uid() OR public.is_property_member(id, auth.uid()));

-- Update reservations RLS to include property members
DROP POLICY IF EXISTS "Users can view reservations for their properties" ON public.reservations;
CREATE POLICY "Users can view reservations for their properties"
ON public.reservations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = reservations.property_id 
    AND properties.user_id = auth.uid()
  ) 
  OR public.is_property_member(property_id, auth.uid())
  OR checkin_token IS NOT NULL
);

-- Trigger for updated_at on property_members
CREATE TRIGGER update_property_members_updated_at
BEFORE UPDATE ON public.property_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();