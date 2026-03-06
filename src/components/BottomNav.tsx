import { Home, BookOpen, Heart, Gamepad2, Flame } from "lucide-react";
import { motion } from "framer-motion";

export type AppTab = "home" | "read" | "comfort" | "games" | "journey";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "read", label: "Read", icon: BookOpen },
  { id: "comfort", label: "Comfort", icon: Heart },
  { id: "games", label: "Play", icon: Gamepad2 },
  { id: "journey", label: "Journey", icon: Flame },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2 px-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 relative min-w-0 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`relative z-10 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`relative z-10 text-[10px] font-body font-semibold transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
