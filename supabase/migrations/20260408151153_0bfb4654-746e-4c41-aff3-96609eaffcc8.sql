
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bible_read BOOLEAN NOT NULL DEFAULT false,
  quiz_completed BOOLEAN NOT NULL DEFAULT false,
  prayer_done BOOLEAN NOT NULL DEFAULT false,
  ai_chat_used BOOLEAN NOT NULL DEFAULT false,
  manna_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_date)
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tasks"
ON public.daily_tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tasks"
ON public.daily_tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tasks"
ON public.daily_tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Also allow users to insert into manna_transactions (needed for earnManna)
CREATE POLICY "Users can insert own transactions"
ON public.manna_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable realtime on daily_tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_tasks;
