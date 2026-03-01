import { motion } from "framer-motion";
import { AppTab } from "@/components/BottomNav";

const speechMap: Record<AppTab, string> = {
  mood: "How are you feeling today? 💛",
  read: "Let's find the perfect verse! 🔍",
  camera: "Show me your face — or tell me how you feel! 📸",
  games: "Ready to play? Let's go! 🎮",
  tracker: "Keep that streak alive! 🔥",
};

interface EdenMascotProps {
  tab: AppTab;
}

const EdenMascot = ({ tab }: EdenMascotProps) => {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      {/* Eden's Head - CSS animated SVG */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0"
      >
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="28" cy="28" r="24" fill="hsl(var(--primary))" />
          <circle cx="28" cy="28" r="24" fill="url(#edenGrad)" />
          {/* Cheeks */}
          <circle cx="16" cy="32" r="4" fill="hsl(var(--accent))" opacity="0.35" />
          <circle cx="40" cy="32" r="4" fill="hsl(var(--accent))" opacity="0.35" />
          {/* Eyes */}
          <EdenEyes />
          {/* Mouth - smile */}
          <path d="M22 34 C24 38, 32 38, 34 34" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Halo */}
          <motion.ellipse
            cx="28" cy="6" rx="14" ry="3"
            stroke="hsl(var(--joy))"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <defs>
            <radialGradient id="edenGrad" cx="0.4" cy="0.3" r="0.7">
              <stop offset="0%" stopColor="hsl(var(--warm-glow))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative bg-card border border-border rounded-2xl rounded-bl-md px-4 py-2 shadow-soft"
      >
        <p className="font-body text-sm text-foreground">{speechMap[tab]}</p>
        {/* Tail */}
        <div className="absolute -left-2 bottom-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-card border-b-[6px] border-b-transparent" />
      </motion.div>
    </div>
  );
};

/** Blinking eyes sub-component */
const EdenEyes = () => {
  return (
    <>
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }}
        style={{ transformOrigin: "20px 26px" }}
      >
        <ellipse cx="20" cy="26" rx="3" ry="3.5" fill="hsl(var(--primary-foreground))" />
        <circle cx="21" cy="25" r="1" fill="hsl(var(--primary))" />
      </motion.g>
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }}
        style={{ transformOrigin: "36px 26px" }}
      >
        <ellipse cx="36" cy="26" rx="3" ry="3.5" fill="hsl(var(--primary-foreground))" />
        <circle cx="37" cy="25" r="1" fill="hsl(var(--primary))" />
      </motion.g>
    </>
  );
};

export default EdenMascot;
