import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Shuffle, Smile, BookOpen, Search, PenLine, Users, Swords, Zap, MessageSquare, Trophy } from "lucide-react";
import TriviaChallenge from "./games/TriviaChallenge";
import VerseScramble from "./games/VerseScramble";
import EmojiParables from "./games/EmojiParables";
import GuessTheBook from "./games/GuessTheBook";
import MemoryVerseGame from "./games/MemoryVerseGame";
import BibleWordSearch from "./games/BibleWordSearch";
import MultiplayerTrivia from "./games/MultiplayerTrivia";

type PlayMode = "menu" | "single" | "multi";
type GameId = string;

const singlePlayerGames = [
  { id: "trivia", title: "Bible Trivia", description: "Test your Bible knowledge!", emoji: "🧠", icon: Brain },
  { id: "scramble", title: "Verse Builder", description: "Rebuild scrambled verses word by word.", emoji: "🔀", icon: Shuffle },
  { id: "emoji", title: "Emoji Bible Story", description: "Guess the Bible story from emojis!", emoji: "😎", icon: Smile },
  { id: "guess", title: "Guess the Book", description: "Which book is this passage from?", emoji: "📖", icon: BookOpen },
  { id: "memory", title: "Memory Verse", description: "Fill in the blanks from memory!", emoji: "🧠", icon: PenLine },
  { id: "wordsearch", title: "Bible Word Search", description: "Find hidden Bible words in the grid!", emoji: "🔍", icon: Search },
];

const multiplayerGames = [
  { id: "mp-trivia", title: "Bible Trivia Battle", description: "Race to answer trivia questions!", emoji: "⚔️", icon: Swords, dbType: "trivia" },
  { id: "mp-verse", title: "Verse Completion Race", description: "Complete verses faster than opponents!", emoji: "⚡", icon: Zap, dbType: "trivia" },
  { id: "mp-character", title: "Guess the Character", description: "Who is this Bible figure?", emoji: "🎭", icon: Users, dbType: "guess_the_book" },
  { id: "mp-quote", title: "Bible Quote Challenge", description: "Match the quote to the book!", emoji: "💬", icon: MessageSquare, dbType: "trivia" },
  { id: "mp-duel", title: "Bible Knowledge Duel", description: "1v1 knowledge showdown!", emoji: "🏆", icon: Trophy, dbType: "trivia" },
];

const GamesHub = () => {
  const [playMode, setPlayMode] = useState<PlayMode>("menu");
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const handleBack = () => {
    if (activeGame) {
      setActiveGame(null);
    } else {
      setPlayMode("menu");
    }
  };

  // Render active game
  const renderGame = () => {
    switch (activeGame) {
      case "trivia": return <TriviaChallenge />;
      case "scramble": return <VerseScramble />;
      case "emoji": return <EmojiParables />;
      case "guess": return <GuessTheBook />;
      case "memory": return <MemoryVerseGame />;
      case "wordsearch": return <BibleWordSearch />;
      default: {
        const mp = multiplayerGames.find((g) => g.id === activeGame);
        if (mp) return <MultiplayerTrivia gameType={mp.id} gameLabel={mp.title} dbGameType={mp.dbType} />;
        return null;
      }
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div key={activeGame} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline">
              <ArrowLeft size={16} /> Back to Games
            </button>
            {renderGame()}
          </motion.div>
        ) : playMode === "menu" ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-display text-2xl text-center mb-2 text-foreground">Games Hub</h2>
            <p className="text-center text-muted-foreground font-body mb-6 text-sm">
              Learn the Bible while having fun — earn Manna! 🎮
            </p>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setPlayMode("single")}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain size={28} className="text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-base text-foreground">Single Player</h3>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">6 games</p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => setPlayMode("multi")}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Swords size={28} className="text-accent" />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-base text-foreground">Multiplayer</h3>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">5 games</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={playMode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button onClick={handleBack} className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="font-display text-xl mb-1 text-foreground">
              {playMode === "single" ? "Single Player" : "Multiplayer"}
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-5">
              {playMode === "single" ? "Challenge yourself with these games!" : "Compete against others — AI joins if needed!"}
            </p>
            <div className="flex flex-col gap-3">
              {(playMode === "single" ? singlePlayerGames : multiplayerGames).map((game, i) => (
                <motion.button
                  key={game.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveGame(game.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm transition-all active:scale-[0.98] text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {game.emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base text-foreground">{game.title}</h3>
                    <p className="font-body text-xs text-muted-foreground truncate">{game.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamesHub;
