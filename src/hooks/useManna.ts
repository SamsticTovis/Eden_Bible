import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useManna = () => {
  const { user } = useAuth();
  const [manna, setManna] = useState(0);
  const [weeklyManna, setWeeklyManna] = useState(0);
  const [mannaToday, setMannaToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchManna = useCallback(async () => {
    if (!user) {
      setManna(0);
      setWeeklyManna(0);
      setMannaToday(0);
      setLoading(false);
      return;
    }

    const { data: entry } = await supabase
      .from("leaderboard_entries")
      .select("total_manna, weekly_manna")
      .eq("user_id", user.id)
      .eq("is_bot", false)
      .maybeSingle();

    if (entry) {
      setManna(entry.total_manna);
      setWeeklyManna(entry.weekly_manna);
    } else {
      setManna(0);
      setWeeklyManna(0);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: txns } = await supabase
      .from("manna_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString());

    if (txns) {
      setMannaToday(txns.reduce((sum, t) => sum + t.amount, 0));
    } else {
      setMannaToday(0);
    }

    setLoading(false);
  }, [user]);

  // Reset on user change
  useEffect(() => {
    setManna(0);
    setWeeklyManna(0);
    setMannaToday(0);
    setLoading(true);
    fetchManna();
  }, [fetchManna]);

  // Real-time subscription scoped to user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`manna-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leaderboard_entries",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (!row.is_bot) {
            setManna(row.total_manna);
            setWeeklyManna(row.weekly_manna);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const earnManna = useCallback(
    async (amount: number, description: string) => {
      if (!user || amount <= 0) return;

      // Optimistic update
      setManna((prev) => prev + amount);
      setWeeklyManna((prev) => prev + amount);
      setMannaToday((prev) => prev + amount);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      const username = profile?.username || user.email?.split("@")[0] || "Player";

      const { data: existing } = await supabase
        .from("leaderboard_entries")
        .select("id, total_manna, weekly_manna, games_played")
        .eq("user_id", user.id)
        .eq("is_bot", false)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("leaderboard_entries")
          .update({
            total_manna: existing.total_manna + amount,
            weekly_manna: existing.weekly_manna + amount,
            updated_at: new Date().toISOString(),
            last_manna_earned_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("leaderboard_entries").insert({
          user_id: user.id,
          username,
          total_manna: amount,
          weekly_manna: amount,
          is_bot: false,
          last_manna_earned_at: new Date().toISOString(),
        });
      }

      await supabase.from("manna_transactions").insert({
        user_id: user.id,
        amount,
        type: "earned",
        description,
      });
    },
    [user]
  );

  const incrementGamesPlayed = useCallback(async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    const username = profile?.username || user.email?.split("@")[0] || "Player";

    const { data: existing } = await supabase
      .from("leaderboard_entries")
      .select("id, games_played")
      .eq("user_id", user.id)
      .eq("is_bot", false)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("leaderboard_entries")
        .update({
          games_played: existing.games_played + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("leaderboard_entries").insert({
        user_id: user.id,
        username,
        games_played: 1,
        is_bot: false,
      });
    }
  }, [user]);

  return { manna, weeklyManna, mannaToday, earnManna, incrementGamesPlayed, loading, refresh: fetchManna };
};
