import { Heart, Gamepad2, Flame, Camera } from "lucide-react";
import { motion } from "framer-motion";

export type AppTab = "mood" | "camera" | "games" | "tracker";

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: typeof Heart }[] = [
  { id: "mood", label: "Mood", icon: Heart },
  { id: "camera", label: "Scan", icon: Camera },
  { id: "games", label: "Play", icon: Gamepad2 },
  { id: "tracker", label: "Commit", icon: Flame },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
              <Icon
                size={22}
                className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[11px] font-body font-medium transition-colors ${
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
