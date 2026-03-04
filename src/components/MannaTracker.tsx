import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

const MANNA_KEY = "eden-manna";
const STREAK_KEY = "eden-streak";
const LAST_LOGIN_KEY = "eden-last-login";

export const getManna = (): number => parseInt(localStorage.getItem(MANNA_KEY) || "0", 10);
export const addManna = (points: number) => localStorage.setItem(MANNA_KEY, String(getManna() + points));

export const getStreak = (): number => {
  const today = new Date().toISOString().split("T")[0];
  const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
  let streak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
  if (lastLogin === today) return streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastLogin === yesterday.toISOString().split("T")[0]) streak += 1;
  else streak = 1;
  localStorage.setItem(STREAK_KEY, String(streak));
  localStorage.setItem(LAST_LOGIN_KEY, today);
  return streak;
};

const MannaTracker = () => {
  const manna = getManna();
  const streak = getStreak();

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 glass px-2.5 py-1 rounded-full"
      >
        <Flame size={14} className="text-secondary" />
        <span className="text-xs font-medium text-foreground/80">{streak}</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1.5 glass px-2.5 py-1 rounded-full"
      >
        <Sparkles size={14} className="text-primary" />
        <span className="text-xs font-medium text-foreground/80">{manna}</span>
      </motion.div>
    </div>
  );
};

export default MannaTracker;
