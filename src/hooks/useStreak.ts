import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  daily_streak: number;
  last_activity_date: string | null;
}

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [justIncremented, setJustIncremented] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_progress")
      .select("daily_streak, last_activity_date")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setStreak(data.daily_streak);
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const recordActivity = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("user_progress")
      .select("daily_streak, last_activity_date")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      // First ever activity
      await supabase.from("user_progress").insert({
        user_id: user.id,
        daily_streak: 1,
        last_activity_date: today,
      });
      setStreak(1);
      setJustIncremented(true);
      setTimeout(() => setJustIncremented(false), 2000);
      return;
    }

    const lastDate = existing.last_activity_date;

    if (lastDate === today) {
      // Already recorded today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak: number;
    if (lastDate === yesterdayStr) {
      newStreak = existing.daily_streak + 1;
    } else {
      newStreak = 1;
    }

    await supabase
      .from("user_progress")
      .update({
        daily_streak: newStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setStreak(newStreak);
    setJustIncremented(newStreak > existing.daily_streak);
    setTimeout(() => setJustIncremented(false), 2000);
  }, [user]);

  return { streak, recordActivity, justIncremented, fetchStreak };
};
