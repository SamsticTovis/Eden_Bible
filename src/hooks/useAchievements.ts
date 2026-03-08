import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Achievement {
  key: string;
  name: string;
  emoji: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { key: "first_chapter", name: "Bible Explorer", emoji: "📖", description: "Read your first Bible chapter" },
  { key: "streak_7", name: "7 Day Streak", emoji: "🔥", description: "Maintain a 7-day streak" },
  { key: "streak_30", name: "30 Day Streak", emoji: "⚡", description: "Maintain a 30-day streak" },
  { key: "first_circle", name: "Prayer Warrior", emoji: "🙏", description: "Join your first prayer group" },
  { key: "first_game_won", name: "Game Champion", emoji: "🏆", description: "Win your first game" },
  { key: "quiz_100", name: "Quiz Master", emoji: "🧠", description: "Answer 100 quiz questions" },
];

export const useAchievements = () => {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("user_achievements")
      .select("achievement_name")
      .eq("user_id", user.id);
    if (data) setUnlocked(new Set(data.map((a: any) => a.achievement_name)));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  const tryUnlock = useCallback(async (key: string) => {
    if (!user || unlocked.has(key)) return false;

    const achievement = ACHIEVEMENTS.find((a) => a.key === key);
    if (!achievement) return false;

    const { error } = await supabase.from("user_achievements").insert({
      user_id: user.id,
      achievement_name: key,
    });

    if (error) {
      // Unique constraint = already unlocked
      if (error.code === "23505") return false;
      console.error("Achievement unlock error:", error);
      return false;
    }

    setUnlocked((prev) => new Set([...prev, key]));

    toast({
      title: `${achievement.emoji} Achievement Unlocked!`,
      description: achievement.name,
    });

    return true;
  }, [user, unlocked]);

  // Check achievements based on current stats
  const checkAchievements = useCallback(async (context: {
    chaptersRead?: number;
    streak?: number;
    circlesJoined?: number;
    gamesWon?: number;
    questionsAnswered?: number;
  }) => {
    if (!user) return;

    if (context.chaptersRead && context.chaptersRead >= 1) await tryUnlock("first_chapter");
    if (context.streak && context.streak >= 7) await tryUnlock("streak_7");
    if (context.streak && context.streak >= 30) await tryUnlock("streak_30");
    if (context.circlesJoined && context.circlesJoined >= 1) await tryUnlock("first_circle");
    if (context.gamesWon && context.gamesWon >= 1) await tryUnlock("first_game_won");
    if (context.questionsAnswered && context.questionsAnswered >= 100) await tryUnlock("quiz_100");
  }, [user, tryUnlock]);

  return { unlocked, loading, tryUnlock, checkAchievements, fetchAchievements };
};
