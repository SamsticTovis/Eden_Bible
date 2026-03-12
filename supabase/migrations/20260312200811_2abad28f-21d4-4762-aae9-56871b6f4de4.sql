
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add plan column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- 6. User bans table
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reason TEXT,
  banned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bans" ON public.user_bans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Manna transactions table
CREATE TABLE public.manna_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'earned',
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manna_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.manna_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage transactions" ON public.manna_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  entry_cost INTEGER NOT NULL DEFAULT 0,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES auth.users(id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are publicly readable" ON public.tournaments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage tournaments" ON public.tournaments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. Tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are viewable" ON public.tournament_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join tournaments" ON public.tournament_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage participants" ON public.tournament_participants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
