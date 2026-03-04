import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

const encouragements = {
  correct: ["You cracked the code! 🎯", "Emoji master! 🧠", "Nailed it! ✨"],
  wrong: ["Tricky one! Now you know 😊", "Great guess 🤔", "So close! 💪"],
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
    const { data } = await supabase.from("game_questions").select("*").eq("game_type", "emoji_parables");
    if (data) setQuestions([...data].sort(() => Math.random() - 0.5).slice(0, 7));
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

  const handleRestart = () => { loadQuestions(); setCurrentIndex(0); setSelected(null); setScore(0); setFinished(false); };

  if (loading) return <div className="text-center py-8"><div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-5xl mb-3">{pct >= 80 ? "🏆" : pct >= 50 ? "😎" : "🌱"}</div>
        <h3 className="font-display text-xl font-bold mb-1 text-foreground">{pct >= 80 ? "Emoji Prophet!" : "Keep exploring!"}</h3>
        <p className="text-muted-foreground font-body text-sm mb-4">{score} of {questions.length} correct</p>
        <Button onClick={handleRestart} size="sm" className="gap-2 bg-primary/15 text-primary hover:bg-primary/25 border-0">
          <RotateCcw size={14} /> Play Again
        </Button>
      </motion.div>
    );
  }

  if (!question) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground font-body">{currentIndex + 1} / {questions.length}</span>
        <span className="text-xs font-medium text-primary">😎 {score}</span>
      </div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Guess the Bible story</p>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="bg-gradient-golden rounded-xl p-5 mb-4 text-center">
            <p className="text-4xl tracking-widest">{question.question}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {options.map(({ key, text }) => {
              let cls = "glass hover:border-primary/30";
              if (selected) {
                if (key === question.correct_option) cls = "bg-primary/10 border-primary/30";
                else if (key === selected) cls = "bg-destructive/10 border-destructive/30";
              }
              return (
                <button key={key} onClick={() => handleSelect(key)} disabled={!!selected}
                  className={`p-3 rounded-xl text-center font-body text-sm transition-all ${cls} ${!selected ? "cursor-pointer active:scale-[0.98]" : ""}`}>
                  <span className="text-foreground/85">{text}</span>
                  {selected && key === question.correct_option && <CheckCircle2 size={14} className="text-primary mx-auto mt-1" />}
                  {selected && key === selected && key !== question.correct_option && <XCircle size={14} className="text-destructive mx-auto mt-1" />}
                </button>
              );
            })}
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div className="bg-gradient-golden rounded-xl p-3 mb-3">
                <p className="font-body text-foreground/70 text-xs">{feedback}</p>
              </div>
              <Button onClick={handleNext} size="sm" className="w-full gap-2 bg-primary/15 text-primary hover:bg-primary/25 border-0">
                {currentIndex + 1 >= questions.length ? "See Results" : "Next"} <ChevronRight size={14} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EmojiParables;
