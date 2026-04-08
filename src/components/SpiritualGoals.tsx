import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Users, MessageCircle, CheckCircle2, Circle, Target, Sparkles, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useManna } from "@/hooks/useManna";

interface Goal {
  key: string;
  label: string;
  icon: React.ElementType;
  taskField: string;
  manna: number;
}

const GOALS: Goal[] = [
  { key: "read", label: "Read a Bible chapter", icon: BookOpen, taskField: "bible_read", manna: 10 },
  { key: "game", label: "Complete a quiz", icon: Gamepad2, taskField: "quiz_completed", manna: 15 },
  { key: "pray", label: "Join a prayer", icon: Users, taskField: "prayer_done", manna: 10 },
  { key: "chat", label: "Chat with Eden AI", icon: MessageCircle, taskField: "ai_chat_used", manna: 5 },
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
  const { mannaToday } = useManna();
  const [taskData, setTaskData] = useState<Record<string, boolean>>({
    bible_read: false,
    quiz_completed: false,
    prayer_done: false,
    ai_chat_used: false,
  });

  const encouragement = useMemo(
    () => encouragements[new Date().getDate() % encouragements.length],
    []
  );

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("daily_tasks")
        .select("bible_read, quiz_completed, prayer_done, ai_chat_used")
        .eq("user_id", user.id)
        .eq("task_date", today)
        .maybeSingle();

      if (data) {
        setTaskData({
          bible_read: data.bible_read,
          quiz_completed: data.quiz_completed,
          prayer_done: data.prayer_done,
          ai_chat_used: data.ai_chat_used,
        });
      }
    };

    load();

    // Real-time subscription on daily_tasks
    const channel = supabase
      .channel("goals-daily-tasks")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "daily_tasks",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row?.task_date === today) {
          setTaskData({
            bible_read: row.bible_read,
            quiz_completed: row.quiz_completed,
            prayer_done: row.prayer_done,
            ai_chat_used: row.ai_chat_used,
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, today]);

  const completed = GOALS.filter((g) => taskData[g.taskField]).length;
  const progress = Math.round((completed / GOALS.length) * 100);

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
            <span className="font-body text-[11px] text-primary font-semibold">+{mannaToday} today</span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {GOALS.map((goal, i) => {
            const done = taskData[goal.taskField];
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
