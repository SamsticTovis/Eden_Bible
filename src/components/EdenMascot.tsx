import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import MannaTracker from "./MannaTracker";
import type { AppTab } from "./BottomNav";

export type EdenMood = "default" | "happy" | "thinking" | "cheering" | "sad";

const idleMessages = [
  "Psst… tap something! I'm bored 😄",
  "Did you know Moses was basically the first explorer? 🗺️",
  "Fun fact: 'Do not be afraid' appears 365 times in the Bible! 📅",
  "Hey! Wanna play a game? 🎮",
  "I believe in you! Keep going! 💪",
  "You're doing amazing today ✨",
  "Try searching for 'peace' — trust me! 🕊️",
];

interface EdenMascotProps {
  message?: string;
  mood?: EdenMood;
  onScanMood?: () => void;
  activeTab?: AppTab;
}

// Positions based on active tab
const getTabPosition = (tab?: AppTab) => {
  switch (tab) {
    case "read": return { x: 120, y: 0, scale: 0.7 };
    case "games": return { x: 0, y: 0, scale: 1 };
    case "camera": return { x: 80, y: -10, scale: 0.8 };
    default: return { x: 0, y: 0, scale: 1 };
  }
};

const EdenMascot = ({ message, mood = "default", onScanMood, activeTab }: EdenMascotProps) => {
  const [currentMessage, setCurrentMessage] = useState(message || "Welcome back! Ready to explore? ✨");
  const [idleTimer, setIdleTimer] = useState(0);

  useEffect(() => {
    if (message) { setCurrentMessage(message); setIdleTimer(0); }
  }, [message]);

  useEffect(() => {
    const interval = setInterval(() => setIdleTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (idleTimer >= 30) {
      setCurrentMessage(idleMessages[Math.floor(Math.random() * idleMessages.length)]);
      setIdleTimer(0);
    }
  }, [idleTimer]);

  const resetIdle = useCallback(() => setIdleTimer(0), []);

  const getMouth = () => {
    switch (mood) {
      case "happy":
      case "cheering":
        return <path d="M20 34 C23 40, 33 40, 36 34" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />;
      case "sad":
        return <path d="M22 38 C25 34, 31 34, 34 38" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />;
      case "thinking":
        return <circle cx="30" cy="36" r="2.5" fill="hsl(var(--foreground))" />;
      default:
        return <path d="M22 35 C24 38, 32 38, 34 35" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" fill="none" />;
    }
  };

  const pos = getTabPosition(activeTab);

  // Hand poses based on tab
  const getLeftHand = () => {
    if (activeTab === "read") return { x: 8, y: 36, rotate: 15 }; // near face
    if (activeTab === "camera") return { x: 2, y: 40, rotate: -20 };
    return { x: 0, y: 42, rotate: 0 }; // waving
  };
  const getRightHand = () => {
    if (activeTab === "read") return { x: 48, y: 36, rotate: -15 }; // near face
    if (activeTab === "camera") return { x: 52, y: 28, rotate: 30 }; // pointing up
    return { x: 56, y: 42, rotate: 0 }; // waving
  };

  const lh = getLeftHand();
  const rh = getRightHand();

  return (
    <div className="flex items-start gap-3 px-4 py-3" onClick={resetIdle}>
      {/* Eden SVG with hands */}
      <motion.div
        animate={{
          x: pos.x > 0 ? undefined : 0,
          y: [0, -4, 0],
          scale: pos.scale,
        }}
        transition={{ y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
        className="flex-shrink-0 relative"
      >
        <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left hand */}
          <motion.circle
            cx={lh.x} cy={lh.y} r="5"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            animate={activeTab === "mood" ? { y: [lh.y, lh.y - 4, lh.y], rotate: [-10, 10, -10] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ transformOrigin: `${lh.x}px ${lh.y}px` }}
          />
          {/* Right hand */}
          <motion.circle
            cx={rh.x} cy={rh.y} r="5"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
            animate={activeTab === "mood" ? { y: [rh.y, rh.y - 4, rh.y], rotate: [10, -10, 10] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            style={{ transformOrigin: `${rh.x}px ${rh.y}px` }}
          />
          {/* Body/head */}
          <circle cx="28" cy="28" r="22" fill="hsl(var(--primary))" />
          <circle cx="28" cy="28" r="22" fill="url(#edenGrad3)" />
          {/* Cheeks - subtle */}
          <circle cx="16" cy="32" r="4" fill="hsl(var(--secondary))" opacity="0.15" />
          <circle cx="40" cy="32" r="4" fill="hsl(var(--secondary))" opacity="0.15" />
          {/* Eyes */}
          <EdenEyes mood={mood} />
          {/* Mouth */}
          {getMouth()}
          {/* Halo */}
          <motion.ellipse
            cx="28" cy="6" rx="12" ry="2.5"
            stroke="hsl(var(--secondary))"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Leaf */}
          <motion.path
            d="M35 8 C38 4, 42 6, 40 10 C38 8, 36 9, 35 8Z"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--border))"
            strokeWidth="0.8"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: "37px 8px" }}
          />
          <defs>
            <radialGradient id="edenGrad3" cx="0.4" cy="0.3" r="0.7">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Speech bubble + controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-base text-foreground tracking-tight">Eden Bible</span>
          <MannaTracker />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="relative glass rounded-2xl rounded-bl-md px-4 py-3 shadow-soft"
          >
            <p className="font-body text-sm text-foreground/90 font-medium leading-relaxed">{currentMessage}</p>
            {onScanMood && (
              <button
                onClick={(e) => { e.stopPropagation(); onScanMood(); }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-medium border border-primary/30 hover:bg-primary/25 transition-all"
              >
                <Camera size={13} />
                Scan My Mood
              </button>
            )}
            {/* Tail */}
            <div className="absolute -left-2 bottom-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-[hsl(222_30%_14%/0.6)] border-b-[6px] border-b-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const EdenEyes = ({ mood }: { mood: EdenMood }) => (
  <>
    <motion.g
      animate={{ scaleY: [1, 0.1, 1] }}
      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }}
      style={{ transformOrigin: "20px 26px" }}
    >
      <ellipse cx="20" cy="26" rx="3" ry="3.5" fill="hsl(var(--background))" />
      <circle cx="21" cy="25" r="1.5" fill="hsl(var(--foreground))" />
    </motion.g>
    <motion.g
      animate={{ scaleY: [1, 0.1, 1] }}
      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }}
      style={{ transformOrigin: "36px 26px" }}
    >
      <ellipse cx="36" cy="26" rx="3" ry="3.5" fill="hsl(var(--background))" />
      <circle cx="37" cy="25" r="1.5" fill="hsl(var(--foreground))" />
    </motion.g>
  </>
);

export default EdenMascot;
