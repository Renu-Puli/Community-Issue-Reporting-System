
-- Drop all existing SELECT/UPDATE policies on complaints and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Workers can view assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can update own complaints for feedback" ON public.complaints;
DROP POLICY IF EXISTS "Workers can update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can update all complaints" ON public.complaints;

-- Recreate as PERMISSIVE (default) so ANY matching policy grants access
CREATE POLICY "Users can view own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Workers can view assigned complaints"
  ON public.complaints FOR SELECT
  USING (has_role(auth.uid(), 'worker'::app_role) AND assigned_worker = auth.uid());

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own complaints for feedback"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Workers can update assigned complaints"
  ON public.complaints FOR UPDATE
  USING (has_role(auth.uid(), 'worker'::app_role) AND assigned_worker = auth.uid());

CREATE POLICY "Admins can update all complaints"
  ON public.complaints FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix profiles SELECT policies to be permissive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Fix user_roles SELECT policy
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for complaints so worker dashboard auto-updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
