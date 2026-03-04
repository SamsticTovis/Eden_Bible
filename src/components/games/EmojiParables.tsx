import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const encouragements = {
  correct: ["You cracked the code! 🎯", "Emoji master! 🧠", "That's it! 🔥", "Nailed it! ✨"],
  wrong: ["Tricky one! Now you know 😊", "Great guess — emojis are sneaky! 🤔", "So close! Try the next one 💪"],
};

const EmojiParables = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("game_questions")
      .select("*")
      .eq("game_type", "emoji_parables");
    if (data) {
      const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 7);
      setQuestions(shuffled);
    }
    setLoading(false);
  };

  const question = questions[currentIndex];
  const options = question ? [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ] : [];
  const isCorrect = selected === question?.correct_option;

  const feedback = useMemo(() => {
    if (!selected) return "";
    const pool = isCorrect ? encouragements.correct : encouragements.wrong;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [selected, isCorrect]);

  const handleSelect = (key: string) => {
    if (selected) return;
    setSelected(key);
    if (key === question.correct_option) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) setFinished(true);
    else { setCurrentIndex((i) => i + 1); setSelected(null); }
  };

  const handleRestart = () => {
    loadQuestions(); setCurrentIndex(0); setSelected(null); setScore(0); setFinished(false);
  };

  if (loading) return (
    <div className="text-center py-12">
      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
    </div>
  );

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "😎" : "🌱"}</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">
          {pct >= 80 ? "Emoji Prophet!" : pct >= 50 ? "Nice decoding!" : "Keep exploring!"}
        </h3>
        <p className="text-muted-foreground font-body mb-2">{score} of {questions.length} correct</p>
        <p className="text-muted-foreground font-body text-sm mb-6">
          {pct >= 80 ? "You speak fluent emoji-Bible! 🔥" : "Every story you learn is a treasure 💎"}
        </p>
        <Button onClick={handleRestart} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcw size={16} /> Play Again
        </Button>
      </motion.div>
    );
  }

  if (!question) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground font-body">{currentIndex + 1} / {questions.length}</span>
        <span className="text-sm font-body font-medium text-primary">😎 {score}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Smile size={16} className="text-primary" />
        <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">Guess the Bible story!</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {/* Emoji display */}
          <div className="bg-gradient-golden rounded-2xl p-6 mb-6 text-center">
            <p className="text-5xl tracking-widest leading-relaxed">{question.question}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {options.map(({ key, text }) => {
              let cls = "bg-card border-border hover:border-primary/50";
              if (selected) {
                if (key === question.correct_option) cls = "bg-primary/10 border-primary/40";
                else if (key === selected) cls = "bg-accent/10 border-accent/40";
              }
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={!!selected}
                  className={`p-4 rounded-xl border-2 text-center font-body transition-all ${cls} ${!selected ? "cursor-pointer active:scale-[0.98]" : ""}`}
                >
                  <span className="text-foreground text-sm font-medium">{text}</span>
                  {selected && key === question.correct_option && <CheckCircle2 size={16} className="text-primary mx-auto mt-1" />}
                  {selected && key === selected && key !== question.correct_option && <XCircle size={16} className="text-accent mx-auto mt-1" />}
                </button>
              );
            })}
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="bg-gradient-golden rounded-xl p-4 mb-4">
                <p className="font-body text-foreground/80 text-sm">{feedback}</p>
              </div>
              <Button onClick={handleNext} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {currentIndex + 1 >= questions.length ? "See Results" : "Next"} <ChevronRight size={16} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EmojiParables;
