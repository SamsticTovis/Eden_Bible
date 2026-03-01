import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shuffle, Smile, X, ChevronUp } from "lucide-react";
import TriviaChallenge from "./games/TriviaChallenge";
import VerseScramble from "./games/VerseScramble";
import EmojiParables from "./games/EmojiParables";

type GameMode = "menu" | "trivia" | "scramble" | "emoji";

interface GamesDrawerProps {
  onEdenReact: (mood: "happy" | "thinking" | "cheering" | "sad", message: string) => void;
}

const games = [
  { id: "trivia" as const, title: "Trivia Blitz", icon: Brain, emoji: "🧠", color: "bg-[hsl(var(--eden-blue))]" },
  { id: "scramble" as const, title: "Verse Scramble", icon: Shuffle, emoji: "🔀", color: "bg-[hsl(var(--eden-purple))]" },
  { id: "emoji" as const, title: "Emoji Parables", icon: Smile, emoji: "😎", color: "bg-[hsl(var(--eden-orange))]" },
];

const GamesDrawer = ({ onEdenReact }: GamesDrawerProps) => {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<GameMode>("menu");

  const startGame = (id: GameMode) => {
    setMode(id);
    setExpanded(true);
    onEdenReact("happy", "Let's go! You got this! 🎮");
  };

  return (
    <div className="mt-4">
      {/* Game grid - always visible */}
      {mode === "menu" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">🎮 Games</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {games.map((game) => (
              <motion.button
                key={game.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(game.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border-2 border-border shadow-bold hover:border-primary/40 transition-all"
              >
                <div className="text-2xl">{game.emoji}</div>
                <span className="font-display font-bold text-xs text-foreground leading-tight text-center">{game.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Active game */}
      <AnimatePresence>
        {mode !== "menu" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button
              onClick={() => setMode("menu")}
              className="flex items-center gap-1 text-primary font-body font-bold text-sm mb-3 hover:underline"
            >
              <X size={16} /> Back to Games
            </button>
            {mode === "trivia" && <TriviaChallenge />}
            {mode === "scramble" && <VerseScramble />}
            {mode === "emoji" && <EmojiParables />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamesDrawer;
