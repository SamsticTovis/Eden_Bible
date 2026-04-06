
-- Leaderboard entries table
CREATE TABLE public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text NOT NULL DEFAULT 'Player',
  is_bot boolean NOT NULL DEFAULT false,
  total_manna integer NOT NULL DEFAULT 0,
  weekly_manna integer NOT NULL DEFAULT 0,
  current_rank text NOT NULL DEFAULT 'Seed',
  last_week_rank text,
  games_played integer NOT NULL DEFAULT 0,
  last_manna_earned_at timestamp with time zone,
  session_manna integer NOT NULL DEFAULT 0,
  session_started_at timestamp with time zone DEFAULT now(),
  week_start timestamp with time zone NOT NULL DEFAULT date_trunc('week', now()),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Everyone can read leaderboard
CREATE POLICY "Leaderboard is publicly readable" ON public.leaderboard_entries
  FOR SELECT TO authenticated USING (true);

-- Users can insert their own entry
CREATE POLICY "Users can insert own entry" ON public.leaderboard_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_bot = false);

-- Users can update own entry
CREATE POLICY "Users can update own entry" ON public.leaderboard_entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_bot = false);

-- Admins can manage all entries (for bots and resets)
CREATE POLICY "Admins can manage all entries" ON public.leaderboard_entries
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_entries;
