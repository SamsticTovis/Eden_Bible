import { Home, BookOpen, Heart, Gamepad2, Flame, Mic } from "lucide-react";
import { motion } from "framer-motion";

export type AppTab = "home" | "read" | "comfort" | "games" | "journey" | "sermons";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "read", label: "Read", icon: BookOpen },
  { id: "sermons", label: "Sermons", icon: Mic },
  { id: "comfort", label: "Comfort", icon: Heart },
  { id: "games", label: "Play", icon: Gamepad2 },
  { id: "journey", label: "Journey", icon: Flame },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto py-1 px-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              onClick={() => onChange(id)}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 relative min-w-0"
            >
              {/* Pill background */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill-bg"
                  className="absolute inset-x-0.5 inset-y-0.5 rounded-2xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Top indicator line */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 -top-1 h-[3px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon with size animation */}
              <motion.div
                animate={{
                  scale: isActive ? 1.3 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  mass: 0.8,
                }}
                className="relative z-10"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.6}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  fontWeight: isActive ? 600 : 400,
                }}
                transition={{ duration: 0.2 }}
                className={`relative z-10 text-[9px] font-body transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
