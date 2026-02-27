
-- Create verses table with tags for searchability
CREATE TABLE public.verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'NIV',
  tags TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT,
  book TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public read access since these are Bible verses)
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verses are publicly readable" ON public.verses
  FOR SELECT USING (true);

-- Index for full-text and tag search
CREATE INDEX idx_verses_tags ON public.verses USING GIN(tags);
CREATE INDEX idx_verses_mood ON public.verses (mood);
CREATE INDEX idx_verses_book ON public.verses (book);
CREATE INDEX idx_verses_text_search ON public.verses USING GIN(to_tsvector('english', text || ' ' || reference));

-- Create game_questions table
CREATE TABLE public.game_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C')),
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  game_type TEXT NOT NULL DEFAULT 'trivia' CHECK (game_type IN ('trivia', 'guess_the_book')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game questions are publicly readable" ON public.game_questions
  FOR SELECT USING (true);

-- Favorites table (requires auth)
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verse_id UUID NOT NULL REFERENCES public.verses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, verse_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);
