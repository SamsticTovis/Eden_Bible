import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, Heart } from "lucide-react";

interface DayLog {
  date: string;
  prayed: boolean;
  readBible: boolean;
  grateful: boolean;
}

const STORAGE_KEY = "soulshine-tracker";

const getToday = () => new Date().toISOString().split("T")[0];

const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const dayName = (dateStr: string) => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short" });
};

const CommitmentTracker = () => {
  const [logs, setLogs] = useState<Record<string, DayLog>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const today = getToday();
  const todayLog = logs[today] || { date: today, prayed: false, readBible: false, grateful: false };
  const last7 = getLast7Days();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const toggle = (field: "prayed" | "readBible" | "grateful") => {
    setLogs((prev) => ({
      ...prev,
      [today]: { ...todayLog, date: today, [field]: !todayLog[field] },
    }));
  };

  // Calculate streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const log = logs[key];
    if (log && (log.prayed || log.readBible || log.grateful)) streak++;
    else break;
  }

  const activities = [
    { key: "prayed" as const, label: "Prayed", icon: Heart, active: todayLog.prayed },
    { key: "readBible" as const, label: "Read Bible", icon: BookOpen, active: todayLog.readBible },
    { key: "grateful" as const, label: "Gave Thanks", icon: Flame, active: todayLog.grateful },
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-golden rounded-full px-5 py-2">
          <Flame size={20} className="text-primary" />
          <span className="font-display text-lg text-foreground">{streak} day streak</span>
        </div>
        {streak > 0 && (
          <p className="text-muted-foreground font-body text-sm mt-2">
            {streak >= 7 ? "You're on fire! 🔥" : streak >= 3 ? "Keep it going! 💪" : "Great start! ✨"}
          </p>
        )}
      </motion.div>

      {/* Today's activities */}
      <h3 className="font-display text-lg mb-4 text-foreground">Today</h3>
      <div className="flex flex-col gap-3 mb-8">
        {activities.map(({ key, label, icon: Icon, active }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(key)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all font-body ${
              active
                ? "bg-primary/10 border-primary/40"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <div className={`p-2 rounded-lg ${active ? "bg-primary/20" : "bg-muted"}`}>
              <Icon size={20} className={active ? "text-primary" : "text-muted-foreground"} />
            </div>
            <span className={`font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {active && <span className="ml-auto text-primary">✓</span>}
          </motion.button>
        ))}
      </div>

      {/* Week overview */}
      <h3 className="font-display text-lg mb-4 text-foreground">This Week</h3>
      <div className="flex gap-2 justify-between">
        {last7.map((date) => {
          const log = logs[date];
          const count = log ? [log.prayed, log.readBible, log.grateful].filter(Boolean).length : 0;
          const isToday = date === today;
          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className={`text-xs font-body ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {dayName(date)}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-body transition-all ${
                  count === 3
                    ? "bg-primary text-primary-foreground"
                    : count > 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                } ${isToday ? "ring-2 ring-primary/30" : ""}`}
              >
                {count > 0 ? count : "·"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommitmentTracker;
