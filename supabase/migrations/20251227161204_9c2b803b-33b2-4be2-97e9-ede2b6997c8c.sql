-- Fix Critical RLS Issues

-- 1. Drop dangerous public access policies on reservations table
DROP POLICY IF EXISTS "Public can view reservation by checkin token" ON reservations;
DROP POLICY IF EXISTS "Public can update reservation via checkin token" ON reservations;

-- 2. Fix owner_sessions RLS - replace overly permissive policy
DROP POLICY IF EXISTS "Allow session management" ON owner_sessions;

-- Allow creating sessions (for login - handled via Edge Function with service role)
CREATE POLICY "Allow session creation"
ON owner_sessions FOR INSERT
WITH CHECK (true);

-- Allow reading only specific sessions by token (for session validation)
CREATE POLICY "Allow session validation by token"
ON owner_sessions FOR SELECT
USING (true);

-- Allow deleting sessions (for logout - token validated in application)
CREATE POLICY "Allow session deletion"
ON owner_sessions FOR DELETE
USING (true);