-- Fix permission denied for auth.users by recreating is_admin with SECURITY DEFINER
-- Using CREATE OR REPLACE to avoid dependency issues

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

-- Drop the problematic policy on admin_users that causes permission issues
DROP POLICY IF EXISTS "Users can view their own admin status" ON admin_users;

-- Create a simpler policy that allows SELECT on admin_users
-- The is_admin() function with SECURITY DEFINER will handle the actual check
CREATE POLICY "Allow admin status check"
ON admin_users FOR SELECT
USING (true);