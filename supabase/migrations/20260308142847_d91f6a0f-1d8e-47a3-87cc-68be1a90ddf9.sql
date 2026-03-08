
CREATE TABLE public.recent_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'BookOpen',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.recent_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.recent_activity
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.recent_activity
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity" ON public.recent_activity
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
