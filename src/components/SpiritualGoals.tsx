import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Users, CheckCircle2, Circle, Target, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Goal {
  key: string;
  label: string;
  icon: React.ElementType;
  check: (data: GoalData) => boolean;
}

interface GoalData {
  chaptersToday: boolean;
  gamesToday: boolean;
  circleToday: boolean;
}

const GOALS: Goal[] = [
  { key: "read", label: "Read one chapter", icon: BookOpen, check: (d) => d.chaptersToday },
  { key: "game", label: "Play one Bible quiz", icon: Gamepad2, check: (d) => d.gamesToday },
  { key: "pray", label: "Join a prayer circle", icon: Users, check: (d) => d.circleToday },
];

const encouragements = [
  "Stay faithful today. Every small step grows your faith.",
  "God sees your effort. Keep pressing forward!",
  "Your consistency is planting seeds of blessing.",
  "Each moment with God transforms your heart.",
  "You're growing stronger in faith every day.",
  "Let today be filled with purpose and praise.",
  "Trust the process — God is shaping you.",
];

const SpiritualGoals = () => {
  const { user } = useAuth();
  const [goalData, setGoalData] = useState<GoalData>({
    chaptersToday: false,
    gamesToday: false,
    circleToday: false,
  });

  const encouragement = useMemo(
    () => encouragements[new Date().getDate() % encouragements.length],
    []
  );

  useEffect(() => {
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const load = async () => {
      const { data: activities } = await supabase
        .from("recent_activity")
        .select("activity_type")
        .eq("user_id", user.id)
        .gte("created_at", todayISO);

      if (activities) {
        const types = new Set(activities.map((a) => a.activity_type));
        setGoalData({
          chaptersToday: types.has("bible_read"),
          gamesToday: types.has("game_played") || types.has("game_won"),
          circleToday: types.has("circle_joined"),
        });
      }
    };

    load();

    // Listen for realtime updates
    const channel = supabase
      .channel("goals-activity")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "recent_activity",
          filter: `user_id=eq.${user.id}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const completed = GOALS.filter((g) => g.check(goalData)).length;
  const progress = Math.round((completed / GOALS.length) * 100);

  return (
    <div className="space-y-4">
      {/* Encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10"
      >
        <Sparkles size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="font-body text-sm text-foreground/80 italic leading-relaxed">
          "{encouragement}"
        </p>
      </motion.div>

      {/* Today's Spiritual Goals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft"
      >
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Target size={14} className="text-primary" />
          <span className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider">
            Today's Spiritual Goals
          </span>
        </div>
        <div className="p-4 space-y-3">
          {GOALS.map((goal, i) => {
            const done = goal.check(goalData);
            return (
              <motion.div
                key={goal.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  done ? "bg-primary/5" : "bg-muted/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  done ? "bg-primary/15" : "bg-muted"
                }`}>
                  <goal.icon size={16} className={done ? "text-primary" : "text-muted-foreground"} />
                </div>
                <span className={`font-body text-sm flex-1 ${
                  done ? "text-foreground line-through opacity-70" : "text-foreground"
                }`}>
                  {goal.label}
                </span>
                {done ? (
                  <CheckCircle2 size={18} className="text-primary" />
                ) : (
                  <Circle size={18} className="text-muted-foreground/30" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activity Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-4 shadow-soft"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-body text-xs text-muted-foreground font-medium">
            Spiritual Activity Progress
          </span>
          <span className="font-display text-sm text-primary font-semibold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3 bg-muted" />
        <p className="font-body text-[10px] text-muted-foreground mt-2">
          {completed}/{GOALS.length} goals completed today
        </p>
      </motion.div>
    </div>
  );
};

export default SpiritualGoals;
