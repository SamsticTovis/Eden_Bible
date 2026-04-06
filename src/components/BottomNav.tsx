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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Glassmorphism background */}
      <div className="mx-3 mb-2 rounded-2xl bg-card/70 backdrop-blur-2xl border border-border/50 shadow-[0_-4px_30px_-8px_hsl(var(--primary)/0.12)]">
        <div className="flex items-center justify-around max-w-lg mx-auto py-1.5 px-1 relative">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <motion.button
                key={id}
                onClick={() => onChange(id)}
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 relative min-w-0 z-10"
              >
                {/* Active glow background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "radial-gradient(circle at center 30%, hsl(var(--primary) / 0.15), transparent 70%)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Floating pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}

                {/* Icon with scale + lift */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.25 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 22,
                    mass: 0.6,
                  }}
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.4 : 1.5}
                    className={`transition-colors duration-300 ${
                      isActive ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "text-muted-foreground"
                    }`}
                  />
                </motion.div>

                {/* Label with fade */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`relative z-10 text-[9px] font-body font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
