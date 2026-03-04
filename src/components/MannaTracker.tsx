import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

const MANNA_KEY = "eden-manna";
const STREAK_KEY = "eden-streak";
const LAST_LOGIN_KEY = "eden-last-login";

export const getManna = (): number => {
  return parseInt(localStorage.getItem(MANNA_KEY) || "0", 10);
};

export const addManna = (points: number) => {
  const current = getManna();
  localStorage.setItem(MANNA_KEY, String(current + points));
};

export const getStreak = (): number => {
  const today = new Date().toISOString().split("T")[0];
  const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
  let streak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);

  if (lastLogin === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastLogin === yesterdayStr) {
    streak += 1;
  } else if (lastLogin !== today) {
    streak = 1;
  }

  localStorage.setItem(STREAK_KEY, String(streak));
  localStorage.setItem(LAST_LOGIN_KEY, today);
  return streak;
};

const MannaTracker = () => {
  const manna = getManna();
  const streak = getStreak();

  return (
    <div className="flex items-center gap-4">
      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 bg-accent/15 px-3 py-1.5 rounded-full"
      >
        <Flame size={16} className="text-accent" />
        <span className="font-body text-sm font-semibold text-foreground">{streak}</span>
      </motion.div>

      {/* Manna */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1.5 bg-primary/15 px-3 py-1.5 rounded-full"
      >
        <Sparkles size={16} className="text-primary" />
        <span className="font-body text-sm font-semibold text-foreground">{manna}</span>
      </motion.div>
    </div>
  );
};

export default MannaTracker;
