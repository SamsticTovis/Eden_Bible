import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [justIncremented, setJustIncremented] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(0);
      return;
    }
    const { data } = await supabase
      .from("user_progress")
      .select("daily_streak, last_activity_date")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setStreak(data.daily_streak);
      const today = new Date().toISOString().split("T")[0];
      if (data.last_activity_date === today) {
        setJustIncremented(true);
        setTimeout(() => setJustIncremented(false), 2000);
      }
    } else {
      setStreak(0);
    }
  }, [user]);

  // Reset state when user changes (logout/switch)
  useEffect(() => {
    setStreak(0);
    setJustIncremented(false);
    fetchStreak();
  }, [fetchStreak]);

  // Listen for changes to user_progress for real-time streak updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`streak-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row?.daily_streak !== undefined) {
            const prev = streak;
            setStreak(row.daily_streak);
            if (row.daily_streak > prev) {
              setJustIncremented(true);
              setTimeout(() => setJustIncremented(false), 2000);
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, streak]);

  return { streak, justIncremented, fetchStreak };
};
