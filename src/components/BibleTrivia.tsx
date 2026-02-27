import { useState, useMemo } from "react";
import { triviaQuestions, TriviaQuestion } from "@/data/bibleVerses";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const BibleTrivia = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const shuffled = useMemo(() => [...triviaQuestions].sort(() => Math.random() - 0.5).slice(0, 5), []);
  const question = shuffled[currentIndex];
  const isCorrect = selected === question?.correctIndex;

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= shuffled.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">{score >= 4 ? "🏆" : score >= 2 ? "⭐" : "📖"}</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">
          {score >= 4 ? "Bible Scholar!" : score >= 2 ? "Nice Work!" : "Keep Learning!"}
        </h3>
        <p className="text-muted-foreground font-body mb-6">
          You got {score} out of {shuffled.length} correct
        </p>
        <Button onClick={handleRestart} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcw size={16} /> Play Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground font-body">
          Question {currentIndex + 1} of {shuffled.length}
        </span>
        <span className="text-sm font-body font-medium text-primary">Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h3 className="font-display text-xl mb-5 text-foreground">{question.question}</h3>
          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => {
              let optClass = "bg-card border-border hover:border-primary/50";
              if (selected !== null) {
                if (i === question.correctIndex) optClass = "bg-mood-peace/20 border-mood-peace";
                else if (i === selected) optClass = "bg-accent/10 border-accent";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`p-4 rounded-xl border-2 text-left font-body transition-all ${optClass} ${selected === null ? "cursor-pointer active:scale-[0.98]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{opt}</span>
                    {selected !== null && i === question.correctIndex && <CheckCircle2 size={20} className="text-mood-peace" />}
                    {selected !== null && i === selected && i !== question.correctIndex && <XCircle size={20} className="text-accent" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="bg-gradient-golden rounded-xl p-4 mb-4">
                <p className="font-body text-foreground/80 text-sm">💡 {question.funFact}</p>
              </div>
              <Button onClick={handleNext} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {currentIndex + 1 >= shuffled.length ? "See Results" : "Next"} <ChevronRight size={16} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BibleTrivia;
