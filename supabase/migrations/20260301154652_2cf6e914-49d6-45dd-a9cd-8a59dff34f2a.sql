
ALTER TABLE public.game_questions DROP CONSTRAINT IF EXISTS game_questions_game_type_check;
ALTER TABLE public.game_questions ADD CONSTRAINT game_questions_game_type_check CHECK (game_type IN ('trivia', 'guess_the_book', 'emoji_parables'));
