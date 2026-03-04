import { Heart, Gamepad2, Flame, Camera, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export type AppTab = "mood" | "read" | "camera" | "games" | "tracker";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: typeof Heart }[] = [
  { id: "mood", label: "Home", icon: Heart },
  { id: "read", label: "Read", icon: BookOpen },
  { id: "camera", label: "Mood", icon: Camera },
  { id: "games", label: "Play", icon: Gamepad2 },
  { id: "tracker", label: "Journey", icon: Flame },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className="glass-strong rounded-2xl px-2 py-2.5 shadow-soft">
        <div className="flex items-center justify-around">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex flex-col items-center gap-0.5 px-3 py-1 relative rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`relative z-10 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`relative z-10 text-[10px] font-medium tracking-wide transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
