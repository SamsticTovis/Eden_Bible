
-- Add invite_code column to prayer_circles
ALTER TABLE public.prayer_circles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Function to generate short invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.invite_code := upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$;

-- Auto-generate invite code on circle creation
CREATE TRIGGER set_invite_code
  BEFORE INSERT ON public.prayer_circles
  FOR EACH ROW EXECUTE FUNCTION public.generate_invite_code();

-- Allow anyone authenticated to look up circles by invite_code for joining
CREATE POLICY "Anyone can lookup circles by invite code"
  ON public.prayer_circles
  FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);
