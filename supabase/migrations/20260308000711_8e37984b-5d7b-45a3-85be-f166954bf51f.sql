
-- Fix search_path on generate_invite_code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.invite_code := upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$;
