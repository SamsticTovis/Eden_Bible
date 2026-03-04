import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
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
  correct: ["Nailed it! 🎯", "You know your Word! 📖", "On fire! 🔥", "That's right! ✨", "Bible scholar! 🏆"],
  wrong: ["So close! You'll get it next time 💪", "Good guess! Now you know 📚", "Learning is winning! 🌱", "No worries — you're growing! ✨"],
};

const TriviaChallenge = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("game_questions")
      .select("*")
      .eq("game_type", "trivia");
    
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
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    loadQuestions();
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "📖"}</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">
          {pct >= 80 ? "Bible Scholar!" : pct >= 50 ? "Great job!" : "Keep learning!"}
        </h3>
        <p className="text-muted-foreground font-body mb-2">
          You got {score} out of {questions.length} correct
        </p>
        <p className="text-muted-foreground font-body text-sm mb-6">
          {pct >= 80 ? "You really know your stuff! 🔥" : pct >= 50 ? "You're getting there — try again to beat your score!" : "Every question you learn makes you stronger in the Word 💪"}
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
        <span className="text-sm text-muted-foreground font-body">
          {currentIndex + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-body font-medium text-primary">{score} pts</span>
        </div>
      </div>

      {/* Difficulty badge */}
      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-body font-medium mb-3 ${
        question.difficulty === "easy" ? "bg-primary/10 text-primary" :
        question.difficulty === "medium" ? "bg-accent/10 text-accent" :
        "bg-destructive/10 text-destructive"
      }`}>
        {question.difficulty}
      </span>

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
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={!!selected}
                  className={`p-4 rounded-xl border-2 text-left font-body transition-all ${cls} ${!selected ? "cursor-pointer active:scale-[0.98]" : ""}`}
                >
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

export default TriviaChallenge;
