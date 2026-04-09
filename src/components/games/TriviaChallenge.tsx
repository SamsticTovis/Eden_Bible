import { useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Sparkles, Zap, Brain, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { useAchievements } from "@/hooks/useAchievements";
import { useManna } from "@/hooks/useManna";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Question {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  category?: string;
  format?: string;
}

const DIFFICULTIES = [
  { key: "easy", label: "Easy", desc: "Well-known Bible stories", icon: BookOpen, color: "text-primary" },
  { key: "medium", label: "Medium", desc: "Good Bible knowledge needed", icon: Brain, color: "text-accent" },
  { key: "hard", label: "Hard", desc: "Deep Bible study required", icon: Zap, color: "text-destructive" },
  { key: "expert", label: "Expert", desc: "For Bible scholars", icon: GraduationCap, color: "text-destructive" },
];

const encouragements = {
  correct: ["Nailed it! 🎯", "You know your Word! 📖", "On fire! 🔥", "That's right! ✨", "Bible scholar! 🏆"],
  wrong: ["So close! You'll get it next time 💪", "Good guess! Now you know 📚", "Learning is winning! 🌱", "No worries — you're growing! ✨"],
};

const TriviaChallenge = () => {
  const { logActivity } = useActivityLogger();
  const { tryUnlock } = useAchievements();
  const { incrementGamesPlayed } = useManna();
  const gameFinishedRef = useRef(false);
  const [phase, setPhase] = useState<"select" | "loading" | "playing" | "finished">("select");
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [usedTopics, setUsedTopics] = useState<string[]>([]);

  const startGame = async (diff: string) => {
    setDifficulty(diff);
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { difficulty: diff, count: 10, mode: "single", usedQuestions: usedTopics },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const qs = data.questions || [];
      if (qs.length === 0) throw new Error("No questions generated");
      setQuestions(qs);
      // Track used topics for anti-repetition
      setUsedTopics((prev) => [...prev, ...qs.map((q: Question) => q.question.slice(0, 40))]);
      setCurrentIndex(0);
      setSelected(null);
      setScore(0);
      setPhase("playing");
    } catch (e: any) {
      console.error("Quiz generation failed:", e);
      toast({ title: "Failed to generate quiz", description: e.message || "Please try again.", variant: "destructive" });
      setPhase("select");
    }
  };

  const question = questions[currentIndex];
  const options = question
    ? [
        { key: "A", text: question.option_a },
        { key: "B", text: question.option_b },
        ...(question.option_c ? [{ key: "C", text: question.option_c }] : []),
        ...(question.option_d ? [{ key: "D", text: question.option_d }] : []),
      ].filter((o) => o.text)
    : [];
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
      setPhase("finished");
      if (!gameFinishedRef.current) {
        gameFinishedRef.current = true;
        logActivity("game_played", "Completed Bible Trivia", "Gamepad2");
        incrementGamesPlayed();
        tryUnlock("first_game_won");
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setPhase("select");
    setQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    gameFinishedRef.current = false;
  };

  // DIFFICULTY SELECT
  if (phase === "select") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧠</div>
          <h3 className="font-display text-2xl text-foreground mb-1">Bible Trivia</h3>
          <p className="font-body text-sm text-muted-foreground">Choose your difficulty level</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DIFFICULTIES.map((d) => (
            <motion.button
              key={d.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startGame(d.key)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-soft hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center">
                <d.icon size={22} className={d.color} />
              </div>
              <span className="font-display text-sm text-foreground">{d.label}</span>
              <span className="font-body text-[10px] text-muted-foreground text-center">{d.desc}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // LOADING
  if (phase === "loading") {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="font-body text-sm text-muted-foreground">Generating {difficulty} questions…</p>
        <p className="font-body text-[10px] text-muted-foreground/70 mt-1">AI is crafting unique questions for you</p>
      </div>
    );
  }

  // FINISHED
  if (phase === "finished") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "📖"}</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">
          {pct >= 80 ? "Bible Scholar!" : pct >= 50 ? "Great job!" : "Keep learning!"}
        </h3>
        <p className="text-muted-foreground font-body mb-1">
          You got {score} out of {questions.length} correct
        </p>
        <Badge variant="outline" className="mb-4 capitalize">{difficulty} mode</Badge>
        <p className="text-muted-foreground font-body text-sm mb-6">
          {pct >= 80 ? "You really know your stuff! 🔥" : pct >= 50 ? "You're getting there — try again!" : "Every question makes you stronger 💪"}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => startGame(difficulty)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <RotateCcw size={16} /> Same Difficulty
          </Button>
          <Button variant="outline" onClick={handleRestart}>Change Level</Button>
        </div>
      </motion.div>
    );
  }

  // PLAYING
  if (!question) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">
          {currentIndex + 1} / {questions.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-body font-medium text-primary">{score} pts</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <Badge variant="outline" className={`text-[10px] capitalize ${
          question.difficulty === "easy" ? "border-primary/30 text-primary" :
          question.difficulty === "medium" ? "border-accent/30 text-accent" :
          "border-destructive/30 text-destructive"
        }`}>
          {question.difficulty}
        </Badge>
        {question.category && (
          <Badge variant="secondary" className="text-[10px]">{question.category}</Badge>
        )}
        {question.format && (
          <Badge variant="secondary" className="text-[10px]">{question.format}</Badge>
        )}
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
