import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Peace be with you today ☀️",
  "Let's read scripture together 📖",
  "Need encouragement? I'm here 💛",
  "God loves you endlessly 🌿",
  "Take a deep breath… 🕊️",
  "You're never alone 🤍",
  "Ready for a Bible challenge? 🎮",
  "His mercy is new every morning 🌅",
];

const FloatingAssistant = () => {
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const [messageIndex, setMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      const maxX = Math.min(window.innerWidth - 70, 340);
      const maxY = Math.min(window.innerHeight - 200, 500);
      setPosition({
        x: 20 + Math.random() * Math.max(maxX - 20, 0),
        y: 100 + Math.random() * Math.max(maxY - 100, 0),
      });
    }, 8000);

    const msgInterval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % messages.length);
        setShowBubble(true);
      }, 600);
    }, 6000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <motion.div
      className="fixed z-40 pointer-events-none"
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: 4, ease: "easeInOut" }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card border border-border rounded-xl px-3 py-1.5 shadow-soft"
          >
            <p className="font-body text-xs text-foreground">{messages[messageIndex]}</p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moon character */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="hsl(var(--primary))" />
          <circle cx="24" cy="24" r="20" fill="url(#moonGrad)" />
          {/* Crescent shadow */}
          <circle cx="30" cy="20" r="14" fill="hsl(var(--warm-glow))" opacity="0.2" />
          {/* Eyes */}
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
          {/* Cheeks */}
          <circle cx="14" cy="27" r="3" fill="hsl(var(--accent))" opacity="0.3" />
          <circle cx="34" cy="27" r="3" fill="hsl(var(--accent))" opacity="0.3" />
          {/* Smile */}
          <path d="M19 28 C21 31, 27 31, 29 28" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Glow */}
          <motion.circle
            cx="24" cy="24" r="22"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            fill="none"
            opacity={0.3}
            animate={{ opacity: [0.2, 0.5, 0.2], r: [22, 23, 22] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <defs>
            <radialGradient id="moonGrad" cx="0.35" cy="0.3" r="0.7">
              <stop offset="0%" stopColor="hsl(var(--joy))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default FloatingAssistant;
