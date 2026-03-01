import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import MannaTracker from "./MannaTracker";

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
}

const EdenMascot = ({ message, mood = "default", onScanMood }: EdenMascotProps) => {
  const [currentMessage, setCurrentMessage] = useState(message || "Welcome back! Ready to explore? ✨");
  const [idleTimer, setIdleTimer] = useState(0);

  // Update message from props
  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIdleTimer(0);
    }
  }, [message]);

  // Idle detection
  useEffect(() => {
    const interval = setInterval(() => {
      setIdleTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (idleTimer >= 30) {
      const random = idleMessages[Math.floor(Math.random() * idleMessages.length)];
      setCurrentMessage(random);
      setIdleTimer(0);
    }
  }, [idleTimer]);

  const resetIdle = useCallback(() => setIdleTimer(0), []);

  // Mouth shape based on mood
  const getMouth = () => {
    switch (mood) {
      case "happy":
      case "cheering":
        return <path d="M20 34 C23 40, 33 40, 36 34" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      case "sad":
        return <path d="M22 38 C25 34, 31 34, 34 38" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      case "thinking":
        return <circle cx="30" cy="36" r="3" fill="hsl(var(--primary-foreground))" />;
      default:
        return <path d="M22 35 C24 38, 32 38, 34 35" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" fill="none" />;
    }
  };

  return (
    <div className="flex items-start gap-3 px-4 py-3" onClick={resetIdle}>
      {/* Eden SVG */}
      <motion.div
        animate={mood === "cheering" ? { y: [0, -8, 0], rotate: [0, -5, 5, 0] } : { y: [0, -4, 0] }}
        transition={mood === "cheering" ? { duration: 0.5, repeat: 3 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex-shrink-0"
      >
        <svg width="64" height="64" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="25" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="3" />
          <circle cx="28" cy="28" r="25" fill="url(#edenGrad2)" />
          {/* Cheeks */}
          <circle cx="15" cy="33" r="5" fill="hsl(var(--secondary))" opacity="0.3" />
          <circle cx="41" cy="33" r="5" fill="hsl(var(--secondary))" opacity="0.3" />
          {/* Eyes */}
          <EdenEyes mood={mood} />
          {/* Mouth */}
          {getMouth()}
          {/* Halo */}
          <motion.ellipse
            cx="28" cy="4" rx="14" ry="3"
            stroke="hsl(var(--secondary))"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Leaf on head */}
          <motion.path
            d="M35 6 C38 2, 42 4, 40 8 C38 6, 36 7, 35 6Z"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: "37px 6px" }}
          />
          <defs>
            <radialGradient id="edenGrad2" cx="0.4" cy="0.3" r="0.7">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Speech bubble + controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-extrabold text-lg text-foreground">Eden Bible</span>
          <MannaTracker />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="relative bg-card border-2 border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-bold"
          >
            <p className="font-body text-sm text-foreground font-medium">{currentMessage}</p>
            {onScanMood && (
              <button
                onClick={(e) => { e.stopPropagation(); onScanMood(); }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-body font-bold border-2 border-accent hover:brightness-110 transition-all btn-3d"
                style={{ boxShadow: "0 3px 0px 0px hsl(var(--accent) / 0.6)" }}
              >
                <Camera size={14} />
                Scan My Mood
              </button>
            )}
            {/* Tail */}
            <div className="absolute -left-2.5 bottom-3 w-0 h-0 border-t-[7px] border-t-transparent border-r-[10px] border-r-card border-b-[7px] border-b-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const EdenEyes = ({ mood }: { mood: EdenMood }) => {
  const eyeVariant = mood === "happy" || mood === "cheering"
    ? { scaleY: [1, 0.1, 1] }
    : { scaleY: [1, 0.1, 1] };

  return (
    <>
      <motion.g
        animate={eyeVariant}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }}
        style={{ transformOrigin: "20px 26px" }}
      >
        <ellipse cx="20" cy="26" rx="3.5" ry="4" fill="hsl(var(--primary-foreground))" />
        <circle cx="21" cy="25" r="1.5" fill="hsl(var(--foreground))" />
      </motion.g>
      <motion.g
        animate={eyeVariant}
        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }}
        style={{ transformOrigin: "36px 26px" }}
      >
        <ellipse cx="36" cy="26" rx="3.5" ry="4" fill="hsl(var(--primary-foreground))" />
        <circle cx="37" cy="25" r="1.5" fill="hsl(var(--foreground))" />
      </motion.g>
    </>
  );
};

export default EdenMascot;
