
-- Fix complaints SELECT policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Workers can view assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;

CREATE POLICY "Users can view own complaints" ON public.complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Workers can view assigned complaints" ON public.complaints FOR SELECT USING (has_role(auth.uid(), 'worker'::app_role) AND assigned_worker = auth.uid());
CREATE POLICY "Admins can view all complaints" ON public.complaints FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix complaints UPDATE policies
DROP POLICY IF EXISTS "Users can update own complaints for feedback" ON public.complaints;
DROP POLICY IF EXISTS "Workers can update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can update all complaints" ON public.complaints;

CREATE POLICY "Users can update own complaints for feedback" ON public.complaints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Workers can update assigned complaints" ON public.complaints FOR UPDATE USING (has_role(auth.uid(), 'worker'::app_role) AND assigned_worker = auth.uid());
CREATE POLICY "Admins can update all complaints" ON public.complaints FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix complaints INSERT policy
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix profiles SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Fix user_roles SELECT
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
