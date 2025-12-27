-- Fix infinite recursion in admin_users RLS policy
-- The current policy references the admin_users table which causes recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create a simple policy that allows reading by matching email
-- Using a direct comparison instead of subquery on the same table
CREATE POLICY "Users can view their own admin status"
ON admin_users FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);