-- Create admin_users table to control admin access by email
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only existing admins can view the admin_users table
CREATE POLICY "Admins can view admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
$$;

-- Create view for admin dashboard stats (profiles count, properties count, etc.)
-- Admins need to be able to see all data for dashboard

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Policy for admins to view all properties
CREATE POLICY "Admins can view all properties"
  ON public.properties
  FOR SELECT
  USING (public.is_admin());

-- Policy for admins to view all reservations
CREATE POLICY "Admins can view all reservations"
  ON public.reservations
  FOR SELECT
  USING (public.is_admin());

-- Policy for admins to view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (public.is_admin());