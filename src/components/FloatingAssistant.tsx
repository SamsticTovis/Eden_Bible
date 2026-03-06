import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Peace be with you today ☀️",
  "Need encouragement? 💛",
  "Want to talk? 🕊️",
  "God loves you endlessly 🌿",
  "Take a deep breath… 🤍",
  "You're never alone ✨",
];

const corners = [
  { x: 16, y: 80 },
  { x: -16, y: 80 },   // right side (will calc)
  { x: 16, y: -100 },  // bottom left (will calc)
  { x: -16, y: -100 }, // bottom right (will calc)
];

interface FloatingAssistantProps {
  onTap?: () => void;
}

const FloatingAssistant = ({ onTap }: FloatingAssistantProps) => {
  const [visible, setVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [corner, setCorner] = useState(0);

  const getPosition = useCallback((c: number) => {
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const h = typeof window !== "undefined" ? window.innerHeight : 700;
    switch (c) {
      case 0: return { x: 16, y: 100 };
      case 1: return { x: w - 72, y: 100 };
      case 2: return { x: 16, y: h - 220 };
      case 3: return { x: w - 72, y: h - 220 };
      default: return { x: 16, y: 100 };
    }
  }, []);

  useEffect(() => {
    // Show after 2s, then cycle every 12s
    const showTimeout = setTimeout(() => setVisible(true), 2000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCorner((c) => (c + 1) % 4);
        setMessageIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 800);
    }, 12000);

    // Auto-hide after 6s of showing
    const hideInterval = setInterval(() => {
      setTimeout(() => setVisible(false), 6000);
    }, 12000);

    return () => {
      clearTimeout(showTimeout);
      clearInterval(interval);
      clearInterval(hideInterval);
    };
  }, []);

  const pos = getPosition(corner);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed z-40 pointer-events-auto cursor-pointer"
          onClick={onTap}
        >
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card border border-border rounded-xl px-3 py-1.5 shadow-soft"
          >
            <p className="font-body text-xs text-foreground">{messages[messageIndex]}</p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-r border-b border-border rotate-45" />
          </motion.div>

          {/* Moon character */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" fill="hsl(var(--primary))" />
              <circle cx="24" cy="24" r="20" fill="url(#moonGrad2)" />
              <circle cx="30" cy="20" r="14" fill="hsl(var(--warm-glow))" opacity="0.2" />
              <motion.g
                animate={{ scaleY: [1, 0.1, 1] }}
                transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 4 }}
                style={{ transformOrigin: "24px 22px" }}
              >
                <circle cx="18" cy="22" r="2.5" fill="hsl(var(--primary-foreground))" />
                <circle cx="19" cy="21.5" r="0.8" fill="hsl(var(--warm-deep))" />
                <circle cx="30" cy="22" r="2.5" fill="hsl(var(--primary-foreground))" />
                <circle cx="31" cy="21.5" r="0.8" fill="hsl(var(--warm-deep))" />
              </motion.g>
              <circle cx="14" cy="27" r="3" fill="hsl(var(--accent))" opacity="0.3" />
              <circle cx="34" cy="27" r="3" fill="hsl(var(--accent))" opacity="0.3" />
              <path d="M19 28 C21 31, 27 31, 29 28" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <defs>
                <radialGradient id="moonGrad2" cx="0.35" cy="0.3" r="0.7">
                  <stop offset="0%" stopColor="hsl(var(--joy))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingAssistant;
