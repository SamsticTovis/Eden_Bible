
CREATE TABLE public.saved_sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sermons" ON public.saved_sermons
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sermons" ON public.saved_sermons
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sermons" ON public.saved_sermons
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
