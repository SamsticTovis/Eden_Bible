import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Sparkles, Users, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addManna } from "@/components/MannaTracker";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
}

interface Player {
  name: string;
  score: number;
  isBot: boolean;
  answered: boolean;
}

const BOT_NAMES = ["Elijah 🤖", "Ruth 🤖", "Moses 🤖", "Esther 🤖"];
const BOT_ACCURACY: Record<string, number> = { easy: 0.8, medium: 0.6, hard: 0.4 };

interface MultiplayerTriviaProps {
  gameType: string;
  gameLabel: string;
  dbGameType: string;
}

const MultiplayerTrivia = ({ gameType, gameLabel, dbGameType }: MultiplayerTriviaProps) => {
  const [phase, setPhase] = useState<"lobby" | "waiting" | "playing" | "results">("lobby");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const myPlayer = players[0];

  const startGame = async () => {
    setLoading(true);
    const { data } = await supabase.from("game_questions").select("*").eq("game_type", dbGameType);
    const qs = data ? [...data].sort(() => Math.random() - 0.5).slice(0, 7) : [];
    setQuestions(qs);
    
    // Start with just the player, wait for others
    setPlayers([{ name: "You", score: 0, isBot: false, answered: false }]);
    setPhase("waiting");
    setCountdown(10);
    setLoading(false);
  };

  // Countdown timer for waiting phase — add bots after 10s
  useEffect(() => {
    if (phase !== "waiting") return;
    if (countdown <= 0) {
      // Add AI bots
      const botCount = 2 + Math.floor(Math.random() * 2); // 2-3 bots
      const bots: Player[] = BOT_NAMES.slice(0, botCount).map((name) => ({
        name, score: 0, isBot: true, answered: false,
      }));
      setPlayers((prev) => [...prev, ...bots]);
      setPhase("playing");
      setCurrentIndex(0);
      setSelected(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const question = questions[currentIndex];
  const options = question ? [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ] : [];
  const isCorrect = selected === question?.correct_option;

  const handleSelect = (key: string) => {
    if (selected || phase !== "playing") return;
    setSelected(key);
    const correct = key === question.correct_option;
    
    // Update player score
    setPlayers((prev) => prev.map((p, i) => {
      if (i === 0) return { ...p, score: correct ? p.score + 1 : p.score, answered: true };
      // Bots answer
      const botCorrect = Math.random() < (BOT_ACCURACY[question.difficulty] ?? 0.5);
      return { ...p, score: botCorrect ? p.score + 1 : p.score, answered: true };
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const manna = (myPlayer?.score || 0) * 2;
      if (manna > 0) addManna(manna);
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setPlayers((prev) => prev.map((p) => ({ ...p, answered: false })));
    }
  };

  const handleRestart = () => {
    setPhase("lobby");
    setPlayers([]);
    setQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
  };

  // LOBBY
  if (phase === "lobby") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="text-5xl mb-4">⚔️</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">{gameLabel}</h3>
        <p className="text-muted-foreground font-body text-sm mb-6">
          Compete against other players! AI opponents join if no one else does.
        </p>
        <Button onClick={startGame} disabled={loading} className="gap-2 bg-primary text-primary-foreground">
          {loading ? "Loading…" : "Find Match"}
        </Button>
      </motion.div>
    );
  }

  // WAITING
  if (phase === "waiting") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-display text-xl mb-2 text-foreground">Searching for players…</h3>
        <p className="text-muted-foreground font-body text-sm mb-2">AI opponents join in {countdown}s</p>
        <div className="w-32 mx-auto bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 10, ease: "linear" }}
          />
        </div>
      </motion.div>
    );
  }

  // RESULTS
  if (phase === "results") {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((p) => !p.isBot) + 1;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">{rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}</div>
        <h3 className="font-display text-2xl mb-4 text-foreground">
          {rank === 1 ? "You Won!" : `You placed #${rank}`}
        </h3>
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          {sorted.map((p, i) => (
            <div key={p.name} className={`flex items-center justify-between py-2 ${i > 0 ? "border-t border-border" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                <span className="font-body text-sm text-foreground">{p.name}</span>
                {p.isBot && <Bot size={12} className="text-muted-foreground" />}
              </div>
              <span className="font-display text-foreground">{p.score}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1 mb-4">
          <Sparkles size={14} className="text-primary" />
          <span className="font-body text-sm text-primary">+{(myPlayer?.score || 0) * 2} Manna</span>
        </div>
        <Button onClick={handleRestart} className="gap-2 bg-primary text-primary-foreground">
          <RotateCcw size={16} /> Play Again
        </Button>
      </motion.div>
    );
  }

  // PLAYING
  if (!question) return null;

  return (
    <div>
      {/* Scoreboard */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {players.map((p) => (
          <div key={p.name} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium ${
            !p.isBot ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {p.name}: {p.score}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">{currentIndex + 1} / {questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-display text-xl mb-5 text-foreground">{question.question}</h3>
          <div className="flex flex-col gap-3">
            {options.map(({ key, text }) => {
              let cls = "bg-card border-border hover:border-primary/50";
              if (selected) {
                if (key === question.correct_option) cls = "bg-primary/10 border-primary/40";
                else if (key === selected) cls = "bg-accent/10 border-accent/40";
              }
              return (
                <button key={key} onClick={() => handleSelect(key)} disabled={!!selected}
                  className={`p-4 rounded-xl border-2 text-left font-body transition-all ${cls} ${!selected ? "cursor-pointer active:scale-[0.98]" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{text}</span>
                    {selected && key === question.correct_option && <CheckCircle2 size={20} className="text-primary" />}
                    {selected && key === selected && key !== question.correct_option && <XCircle size={20} className="text-accent" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <Button onClick={handleNext} className="w-full gap-2 bg-primary text-primary-foreground">
                {currentIndex + 1 >= questions.length ? "See Results" : "Next"} <ChevronRight size={16} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MultiplayerTrivia;
