import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Users, MessageCircle, CheckCircle2, Circle, Target, Sparkles, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Goal {
  key: string;
  label: string;
  icon: React.ElementType;
  check: (data: GoalData) => boolean;
  manna: number;
}

interface GoalData {
  chaptersToday: boolean;
  gamesToday: boolean;
  circleToday: boolean;
  chatToday: boolean;
}

const GOALS: Goal[] = [
  { key: "read", label: "Read a Bible chapter", icon: BookOpen, check: (d) => d.chaptersToday, manna: 10 },
  { key: "game", label: "Complete a quiz", icon: Gamepad2, check: (d) => d.gamesToday, manna: 15 },
  { key: "pray", label: "Join a prayer", icon: Users, check: (d) => d.circleToday, manna: 10 },
  { key: "chat", label: "Chat with Eden AI", icon: MessageCircle, check: (d) => d.chatToday, manna: 5 },
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
    chatToday: false,
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
          chatToday: types.has("chat"),
        });
      }
    };

    load();

    const channel = supabase
      .channel("goals-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "recent_activity", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const completed = GOALS.filter((g) => g.check(goalData)).length;
  const progress = Math.round((completed / GOALS.length) * 100);
  const mannaEarned = GOALS.filter((g) => g.check(goalData)).reduce((sum, g) => sum + g.manna, 0);

  return (
    <div className="space-y-4">
      {/* Encouragement */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
        <Sparkles size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="font-body text-sm text-foreground/80 italic leading-relaxed">"{encouragement}"</p>
      </motion.div>

      {/* Goals Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-soft">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-primary" />
            <span className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider">Today's Goals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins size={12} className="text-primary" />
            <span className="font-body text-[11px] text-primary font-semibold">+{mannaEarned} today</span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {GOALS.map((goal, i) => {
            const done = goal.check(goalData);
            return (
              <motion.div
                key={goal.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  done ? "bg-primary/8 border border-primary/15" : "bg-muted/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${done ? "bg-primary/15" : "bg-muted"}`}>
                  <goal.icon size={16} className={done ? "text-primary" : "text-muted-foreground"} />
                </div>
                <span className={`font-body text-sm flex-1 transition-all ${done ? "text-foreground line-through opacity-70" : "text-foreground"}`}>
                  {goal.label}
                </span>
                <span className="font-body text-[10px] text-muted-foreground">+{goal.manna}</span>
                {done ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                    <CheckCircle2 size={18} className="text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]" />
                  </motion.div>
                ) : (
                  <Circle size={18} className="text-muted-foreground/30" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-soft">
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-body text-xs text-muted-foreground font-medium">Daily Progress</span>
          <motion.span key={progress} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={`font-display text-sm font-semibold ${progress === 100 ? "text-primary" : "text-foreground"}`}>
            {progress}%
          </motion.span>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3 bg-muted" />
          {progress === 100 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: 2 }} className="absolute inset-0 rounded-full bg-primary/20" />
          )}
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-2">
          {completed}/{GOALS.length} goals completed {progress === 100 && "🎉"}
        </p>
      </motion.div>
    </div>
  );
};

export default SpiritualGoals;
