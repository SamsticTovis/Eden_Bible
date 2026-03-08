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
      <div className="flex items-center justify-around max-w-lg mx-auto py-1.5 px-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center gap-0.5 px-2 py-2 relative min-w-0 transition-all active:scale-95"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-1 -top-0.5 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={18}
                strokeWidth={isActive ? 2.2 : 1.6}
                className={`relative z-10 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`relative z-10 text-[9px] font-body font-medium transition-colors duration-200 ${
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
