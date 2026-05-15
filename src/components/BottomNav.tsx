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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom pointer-events-none">
      <div className="mx-3 mb-3 pointer-events-auto rounded-[1.75rem] glass shadow-elevated">
        <div className="flex items-center justify-around max-w-lg mx-auto py-2 px-2 relative">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <motion.button
                key={id}
                onClick={() => onChange(id)}
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-1 px-2.5 py-2 relative min-w-0 z-10 flex-1"
              >
                {/* Active filled pill */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-x-1 inset-y-0.5 rounded-2xl"
                    style={{
                      background: "linear-gradient(180deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.08))",
                      border: "1px solid hsl(var(--primary) / 0.35)",
                      boxShadow: "0 6px 20px -8px hsl(var(--primary) / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.4)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className={`transition-colors duration-300 ${
                      isActive
                        ? "text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
                        : "text-muted-foreground/70"
                    }`}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.55 }}
                  transition={{ duration: 0.3 }}
                  className={`relative z-10 text-[9.5px] font-body tracking-wide transition-colors duration-300 ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground/80 font-medium"
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
