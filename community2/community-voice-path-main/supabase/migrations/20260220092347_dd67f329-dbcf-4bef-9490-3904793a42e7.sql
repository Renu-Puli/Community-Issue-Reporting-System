
-- Add worker_id column to profiles
ALTER TABLE public.profiles ADD COLUMN worker_id text;

-- Create a function to generate unique 5-digit worker ID
CREATE OR REPLACE FUNCTION public.generate_worker_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    new_id := LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE worker_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Update handle_new_user to auto-assign worker_id for workers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _worker_id text := NULL;
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'worker' THEN
    _worker_id := public.generate_worker_id();
  END IF;

  INSERT INTO public.profiles (user_id, name, email, language, profession, worker_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    NEW.raw_user_meta_data->>'profession',
    _worker_id
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'user'));
  RETURN NEW;
END;
$$;
