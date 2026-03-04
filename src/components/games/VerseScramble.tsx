import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Verse { id: string; reference: string; text: string; }

const VerseScramble = () => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVerses(); }, []);

  const loadVerses = async () => {
    setLoading(true);
    const { data } = await supabase.from("verses").select("id, reference, text").limit(50);
    if (data) {
      const short = data.filter((v) => v.text.split(/\s+/).length <= 14);
      setVerses([...short].sort(() => Math.random() - 0.5).slice(0, 5));
    }
    setLoading(false);
  };

  const verse = verses[currentIndex];
  const words = useMemo(() => verse?.text.replace(/[""]/g, "").split(/\s+/) || [], [verse]);
  const scrambled = useMemo(() => [...words].sort(() => Math.random() - 0.5), [words]);

  const handleWordTap = (word: string) => {
    if (solved) return;
    const newPlaced = [...placed, word];
    setPlaced(newPlaced);
    if (newPlaced.length === words.length && newPlaced.every((w, i) => w === words[i])) {
      setSolved(true); setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= verses.length) setFinished(true);
    else { setCurrentIndex((i) => i + 1); setPlaced([]); setSolved(false); }
  };

  const handleRestart = () => { loadVerses(); setCurrentIndex(0); setPlaced([]); setSolved(false); setScore(0); setFinished(false); };
  const isWrongAttempt = placed.length === words.length && !solved;

  if (loading) return <div className="text-center py-8"><div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  if (finished) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
      <div className="text-5xl mb-3">{score >= 4 ? "🏆" : score >= 2 ? "🧩" : "📖"}</div>
      <h3 className="font-display text-xl font-bold mb-1 text-foreground">{score >= 4 ? "Word Master!" : "Great effort!"}</h3>
      <p className="text-muted-foreground font-body text-sm mb-4">Unscrambled {score} of {verses.length}</p>
      <Button onClick={handleRestart} size="sm" className="gap-2 bg-primary/15 text-primary hover:bg-primary/25 border-0">
        <RotateCcw size={14} /> Play Again
      </Button>
    </motion.div>
  );

  if (!verse) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-body">{currentIndex + 1} / {verses.length}</span>
        <span className="text-xs font-medium text-primary">🧩 {score}</span>
      </div>

      <h3 className="font-display text-sm font-semibold mb-1 text-foreground">Unscramble this verse:</h3>
      <p className="text-xs text-muted-foreground font-body mb-3">{verse.reference}</p>

      <div className="min-h-[60px] glass rounded-xl p-3 mb-3 flex flex-wrap gap-1.5">
        {placed.length === 0 && <span className="text-muted-foreground font-body text-xs">Tap words below...</span>}
        {placed.map((word, i) => (
          <motion.span key={`${word}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className={`px-2 py-1 rounded-md text-xs font-body font-medium ${
              solved ? "bg-primary/15 text-primary" : isWrongAttempt ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground/80"
            }`}>{word}</motion.span>
        ))}
      </div>

      {solved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
          <div className="bg-gradient-golden rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-primary" />
            <p className="font-body text-xs text-foreground/70">Perfect! ✨</p>
          </div>
        </motion.div>
      )}

      {isWrongAttempt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
          <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3">
            <p className="font-body text-xs text-foreground/70">Almost! Try rearranging 💪</p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {scrambled.map((word, i) => (
          <motion.button key={`${word}-${i}`} whileTap={{ scale: 0.9 }} onClick={() => handleWordTap(word)}
            disabled={solved || (placed.filter((p) => p === word).length >= scrambled.filter((s) => s === word).length)}
            className={`px-2 py-1 rounded-md text-xs font-body font-medium transition-all ${
              placed.filter((p) => p === word).length >= scrambled.filter((s) => s === word).length
                ? "bg-muted/30 text-muted-foreground/30" : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}>{word}</motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        {!solved && placed.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={() => setPlaced(placed.slice(0, -1))} className="gap-1 font-body glass border-0 text-xs">
              <Undo2 size={12} /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setPlaced([]); setSolved(false); }} className="gap-1 font-body glass border-0 text-xs">
              <RotateCcw size={12} /> Reset
            </Button>
          </>
        )}
        {(solved || isWrongAttempt) && (
          <Button onClick={solved ? handleNext : () => { setPlaced([]); setSolved(false); }} size="sm"
            className="ml-auto gap-1 bg-primary/15 text-primary hover:bg-primary/25 border-0 font-body text-xs">
            {solved ? (currentIndex + 1 >= verses.length ? "See Results" : "Next →") : "Try Again"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerseScramble;
