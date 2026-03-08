
-- Drop overly permissive policies on owner_sessions
DROP POLICY IF EXISTS "Allow session creation" ON public.owner_sessions;
DROP POLICY IF EXISTS "Allow session deletion" ON public.owner_sessions;
DROP POLICY IF EXISTS "Allow session validation by token" ON public.owner_sessions;
