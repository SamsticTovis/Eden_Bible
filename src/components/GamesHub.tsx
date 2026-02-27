import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Shuffle, BookMarked } from "lucide-react";
import TriviaChallenge from "./games/TriviaChallenge";
import VerseScramble from "./games/VerseScramble";
import GuessTheBook from "./games/GuessTheBook";

type GameMode = "menu" | "trivia" | "scramble" | "guess";

const games = [
  {
    id: "trivia" as const,
    title: "Trivia Challenge",
    description: "Test your Bible knowledge with fun multiple choice questions!",
    icon: Brain,
    emoji: "🧠",
  },
  {
    id: "scramble" as const,
    title: "Verse Scramble",
    description: "Unscramble the words to reveal the verse!",
    icon: Shuffle,
    emoji: "🔀",
  },
  {
    id: "guess" as const,
    title: "Guess the Book",
    description: "Which book of the Bible is this famous verse from?",
    icon: BookMarked,
    emoji: "📚",
  },
];

const GamesHub = () => {
  const [mode, setMode] = useState<GameMode>("menu");

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {mode === "menu" ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-display text-2xl text-center mb-2 text-foreground">Games Hub</h2>
            <p className="text-center text-muted-foreground font-body mb-8 text-sm">
              Learn the Bible while having fun — no pressure! 🎮
            </p>
            <div className="flex flex-col gap-4">
              {games.map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMode(game.id)}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.98] text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {game.emoji}
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">{game.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{game.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button
              onClick={() => setMode("menu")}
              className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline"
            >
              <ArrowLeft size={16} /> Back to Games
            </button>
            {mode === "trivia" && <TriviaChallenge />}
            {mode === "scramble" && <VerseScramble />}
            {mode === "guess" && <GuessTheBook />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamesHub;
