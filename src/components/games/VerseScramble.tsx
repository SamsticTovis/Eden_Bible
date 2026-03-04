import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Verse {
  id: string;
  reference: string;
  text: string;
}

const VerseScramble = () => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("verses")
      .select("id, reference, text")
      .limit(50);
    
    if (data) {
      // Pick short verses (< 15 words) for scramble
      const short = data.filter((v) => v.text.split(/\s+/).length <= 14);
      const shuffled = [...short].sort(() => Math.random() - 0.5).slice(0, 5);
      setVerses(shuffled);
    }
    setLoading(false);
  };

  const verse = verses[currentIndex];
  const words = useMemo(() => verse?.text.replace(/[""]/g, "").split(/\s+/) || [], [verse]);
  const scrambled = useMemo(() => [...words].sort(() => Math.random() - 0.5), [words]);

  const available = scrambled.filter((w) => {
    const placedCopy = [...placed];
    const idx = placedCopy.indexOf(w);
    if (idx >= 0) placedCopy.splice(idx, 1);
    return placedCopy.indexOf(w) === -1 || scrambled.filter((s) => s === w).length > placed.filter((p) => p === w).length;
  });

  const handleWordTap = (word: string) => {
    if (solved) return;
    const newPlaced = [...placed, word];
    setPlaced(newPlaced);
    
    // Check if solved
    if (newPlaced.length === words.length) {
      const correct = newPlaced.every((w, i) => w === words[i]);
      if (correct) {
        setSolved(true);
        setScore((s) => s + 1);
      }
    }
  };

  const handleUndo = () => {
    if (placed.length > 0 && !solved) {
      setPlaced(placed.slice(0, -1));
    }
  };

  const handleReset = () => {
    setPlaced([]);
    setSolved(false);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= verses.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setPlaced([]);
      setSolved(false);
    }
  };

  const handleRestart = () => {
    loadVerses();
    setCurrentIndex(0);
    setPlaced([]);
    setSolved(false);
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
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="text-6xl mb-4">{score >= 4 ? "🏆" : score >= 2 ? "🧩" : "📖"}</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">
          {score >= 4 ? "Word Master!" : score >= 2 ? "Nice work!" : "Great effort!"}
        </h3>
        <p className="text-muted-foreground font-body mb-2">Unscrambled {score} of {verses.length} verses</p>
        <p className="text-muted-foreground font-body text-sm mb-6">
          Every verse you piece together plants a seed in your heart 🌱
        </p>
        <Button onClick={handleRestart} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcw size={16} /> Play Again
        </Button>
      </motion.div>
    );
  }

  if (!verse) return null;

  // Check if current arrangement is wrong (all placed but incorrect)
  const isWrongAttempt = placed.length === words.length && !solved;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">{currentIndex + 1} / {verses.length}</span>
        <span className="text-sm font-body font-medium text-primary">🧩 {score}</span>
      </div>

      <h3 className="font-display text-lg mb-2 text-foreground">Unscramble this verse:</h3>
      <p className="text-sm text-muted-foreground font-body mb-4">{verse.reference}</p>

      {/* Placed words area */}
      <div className="min-h-[80px] bg-card border-2 border-dashed border-border rounded-xl p-3 mb-4 flex flex-wrap gap-2">
        {placed.length === 0 && (
          <span className="text-muted-foreground font-body text-sm">Tap words below to arrange them...</span>
        )}
        {placed.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-3 py-1.5 rounded-lg text-sm font-body font-medium ${
              solved
                ? "bg-primary/15 text-primary border border-primary/30"
                : isWrongAttempt
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-muted text-foreground"
            }`}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Feedback */}
      {solved && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="bg-gradient-golden rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary" />
            <p className="font-body text-sm text-foreground">Perfect! You've got a gift for this! ✨</p>
          </div>
        </motion.div>
      )}

      {isWrongAttempt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-3">
            <p className="font-body text-sm text-foreground/80">Almost! Try rearranging — you're so close! 💪</p>
          </div>
        </motion.div>
      )}

      {/* Available words */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scrambled.map((word, i) => {
          const usedCount = placed.filter((p) => p === word).length;
          const totalCount = scrambled.filter((s) => s === word).length;
          const isUsed = usedCount >= totalCount - (scrambled.slice(i + 1).filter((s) => s === word).length > 0 ? 0 : 0);
          // Simpler: check if this specific index has been "consumed"
          const indexUsed = i < placed.length && scrambled.slice(0, i + 1).filter((s) => s === word).length <= placed.filter((p) => p === word).length;

          return (
            <motion.button
              key={`${word}-${i}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleWordTap(word)}
              disabled={solved || (placed.filter((p) => p === word).length >= scrambled.filter((s) => s === word).length)}
              className={`px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-all ${
                placed.filter((p) => p === word).length >= scrambled.filter((s) => s === word).length
                  ? "bg-muted/50 text-muted-foreground/30"
                  : "bg-primary/10 text-primary hover:bg-primary/20 active:scale-95"
              }`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!solved && placed.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleUndo} className="gap-1 font-body">
              <Undo2 size={14} /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1 font-body">
              <RotateCcw size={14} /> Reset
            </Button>
          </>
        )}
        {(solved || isWrongAttempt) && (
          <Button onClick={solved ? handleNext : handleReset} className="ml-auto gap-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body">
            {solved ? (currentIndex + 1 >= verses.length ? "See Results" : "Next Verse →") : "Try Again"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerseScramble;
