import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { useManna } from "@/hooks/useManna";

const MannaTracker = () => {
  const { manna } = useManna();
  const { streak, justIncremented } = useStreak();

  return (
    <div className="flex items-center gap-4">
      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 bg-accent/15 px-3 py-1.5 rounded-full"
      >
        <AnimatePresence mode="wait">
          {justIncremented ? (
            <motion.div
              key="fire-anim"
              initial={{ scale: 1.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            >
              <Flame size={16} className="text-accent" />
            </motion.div>
          ) : (
            <motion.div key="fire-static">
              <Flame size={16} className="text-accent" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.span
          key={streak}
          initial={justIncremented ? { scale: 1.4, color: "hsl(var(--accent))" } : {}}
          animate={{ scale: 1, color: "hsl(var(--foreground))" }}
          transition={{ duration: 0.5 }}
          className="font-body text-sm font-semibold"
        >
          {streak}
        </motion.span>
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
