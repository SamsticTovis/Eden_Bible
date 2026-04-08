import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useManna } from "@/hooks/useManna";

export type ActivityIcon = "BookOpen" | "Gamepad2" | "Users" | "MessageCircle" | "Heart";

const TASK_MANNA: Record<string, number> = {
  bible_read: 10,
  quiz_completed: 15,
  prayer_done: 10,
  ai_chat_used: 5,
};

const ACTIVITY_TO_TASK: Record<string, string> = {
  bible_read: "bible_read",
  read: "bible_read",
  game_played: "quiz_completed",
  game_won: "quiz_completed",
  circle_joined: "prayer_done",
  prayer: "prayer_done",
  chat: "ai_chat_used",
};

const STREAK_REWARDS: Record<number, number> = {
  3: 20,
  7: 50,
  30: 200,
};

export const useActivityLogger = () => {
  const { user } = useAuth();
  const { earnManna } = useManna();

  const logActivity = useCallback(
    async (type: string, description: string, icon: ActivityIcon = "BookOpen") => {
      if (!user) return;

      // 1. Insert into recent_activity
      await supabase.from("recent_activity").insert({
        user_id: user.id,
        activity_type: type,
        description,
        icon,
      });

      // 2. Upsert daily_tasks and award manna if task is new
      const taskField = ACTIVITY_TO_TASK[type];
      if (taskField) {
        const today = new Date().toISOString().split("T")[0];

        // Check existing daily task record
        const { data: existing } = await supabase
          .from("daily_tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("task_date", today)
          .maybeSingle();

        if (!existing) {
          // Create new daily task record with this task marked true
          const taskRow: any = {
            user_id: user.id,
            task_date: today,
            [taskField]: true,
            manna_awarded: TASK_MANNA[taskField] || 0,
          };
          await supabase.from("daily_tasks").insert(taskRow);

          // Award task manna
          if (TASK_MANNA[taskField]) {
            await earnManna(TASK_MANNA[taskField], `Daily goal: ${description}`);
          }

          // First task of the day — update streak
          await updateStreak(user.id);
        } else if (!(existing as any)[taskField]) {
          // Task not yet completed today — mark it
          await supabase
            .from("daily_tasks")
            .update({
              [taskField]: true,
              manna_awarded: (existing.manna_awarded || 0) + (TASK_MANNA[taskField] || 0),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          // Award task manna
          if (TASK_MANNA[taskField]) {
            await earnManna(TASK_MANNA[taskField], `Daily goal: ${description}`);
          }
        }
        // If task was already true, no duplicate reward
      }
    },
    [user, earnManna]
  );

  return { logActivity };
};

async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data: progress } = await supabase
    .from("user_progress")
    .select("daily_streak, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (!progress) {
    await supabase.from("user_progress").insert({
      user_id: userId,
      daily_streak: 1,
      last_activity_date: today,
    });
    return;
  }

  if (progress.last_activity_date === today) return; // Already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak = progress.last_activity_date === yesterdayStr
    ? progress.daily_streak + 1
    : 1;

  await supabase
    .from("user_progress")
    .update({
      daily_streak: newStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Streak milestone rewards
  if (STREAK_REWARDS[newStreak]) {
    const bonus = STREAK_REWARDS[newStreak];
    // Insert manna transaction directly (can't use hook here)
    await supabase.from("manna_transactions").insert({
      user_id: userId,
      amount: bonus,
      type: "streak_bonus",
      description: `${newStreak}-day streak bonus!`,
    });

    // Update leaderboard
    const { data: entry } = await supabase
      .from("leaderboard_entries")
      .select("id, total_manna, weekly_manna")
      .eq("user_id", userId)
      .eq("is_bot", false)
      .maybeSingle();

    if (entry) {
      await supabase
        .from("leaderboard_entries")
        .update({
          total_manna: entry.total_manna + bonus,
          weekly_manna: entry.weekly_manna + bonus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entry.id);
    }
  }
}
