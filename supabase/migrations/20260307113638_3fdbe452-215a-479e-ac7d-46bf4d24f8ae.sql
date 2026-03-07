-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  reading_streak integer NOT NULL DEFAULT 0,
  chapters_read integer NOT NULL DEFAULT 0,
  games_won integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Chat messages for AI memory
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Prayer circles
CREATE TABLE public.prayer_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prayer_circles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.prayer_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their circles" ON public.prayer_circles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = prayer_circles.id AND user_id = auth.uid()));
CREATE POLICY "Authenticated users can create circles" ON public.prayer_circles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can delete circle" ON public.prayer_circles FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Members can view circle members" ON public.circle_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can join circles" ON public.circle_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave circles" ON public.circle_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Prayer requests
CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.prayer_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  verse_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can view requests" ON public.prayer_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = prayer_requests.circle_id AND user_id = auth.uid()));
CREATE POLICY "Circle members can create requests" ON public.prayer_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = prayer_requests.circle_id AND user_id = auth.uid()));

-- Amen reactions
CREATE TABLE public.prayer_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction text NOT NULL DEFAULT 'amen',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id, user_id)
);
ALTER TABLE public.prayer_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circle members can view reactions" ON public.prayer_reactions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prayer_requests pr
    JOIN public.circle_members cm ON cm.circle_id = pr.circle_id
    WHERE pr.id = prayer_reactions.request_id AND cm.user_id = auth.uid()
  ));
CREATE POLICY "Circle members can react" ON public.prayer_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.prayer_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);