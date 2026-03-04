import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shuffle, Smile, X } from "lucide-react";
import TriviaChallenge from "./games/TriviaChallenge";
import VerseScramble from "./games/VerseScramble";
import EmojiParables from "./games/EmojiParables";

type GameMode = "menu" | "trivia" | "scramble" | "emoji";

interface GamesDrawerProps {
  onEdenReact: (mood: "happy" | "thinking" | "cheering" | "sad", message: string) => void;
}

const games = [
  { id: "trivia" as const, title: "Trivia Blitz", icon: Brain, emoji: "🧠" },
  { id: "scramble" as const, title: "Verse Scramble", icon: Shuffle, emoji: "🔀" },
  { id: "emoji" as const, title: "Emoji Parables", icon: Smile, emoji: "😎" },
];

const GamesDrawer = ({ onEdenReact }: GamesDrawerProps) => {
  const [mode, setMode] = useState<GameMode>("menu");

  const startGame = (id: GameMode) => {
    setMode(id);
    onEdenReact("happy", "Let's go! You got this! 🎮");
  };

  return (
    <div className="mt-4">
      {mode === "menu" && (
        <div>
          <p className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-widest mb-3">🎮 Games</p>
          <div className="grid grid-cols-3 gap-2">
            {games.map((game) => (
              <motion.button
                key={game.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(game.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl glass hover:border-primary/30 transition-all"
              >
                <div className="text-xl">{game.emoji}</div>
                <span className="font-display font-medium text-[11px] text-foreground/80 leading-tight text-center">{game.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {mode !== "menu" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <button onClick={() => setMode("menu")} className="flex items-center gap-1 text-primary font-medium text-sm mb-3 hover:underline">
              <X size={14} /> Back to Games
            </button>
            <div className="glass rounded-xl p-4">
              {mode === "trivia" && <TriviaChallenge />}
              {mode === "scramble" && <VerseScramble />}
              {mode === "emoji" && <EmojiParables />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamesDrawer;
