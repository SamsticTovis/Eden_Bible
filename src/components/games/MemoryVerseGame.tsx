import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addManna } from "@/components/MannaTracker";

const MemoryVerseGame = () => {
  const [verses, setVerses] = useState<{ reference: string; text: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hiddenWords, setHiddenWords] = useState<Set<number>>(new Set());
  const [revealedWrong, setRevealedWrong] = useState<Set<number>>(new Set());
  const [userInput, setUserInput] = useState("");
  const [activeBlank, setActiveBlank] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [solvedBlanks, setSolvedBlanks] = useState<Set<number>>(new Set());

  useEffect(() => { loadVerses(); }, []);

  const loadVerses = async () => {
    setLoading(true);
    const { data } = await supabase.from("verses").select("reference, text").limit(50);
    if (data) {
      const short = data.filter((v) => v.text.split(/\s+/).length >= 6 && v.text.split(/\s+/).length <= 20);
      const picked = [...short].sort(() => Math.random() - 0.5).slice(0, 5);
      setVerses(picked);
      if (picked.length > 0) generateBlanks(picked[0].text);
    }
    setLoading(false);
  };

  const generateBlanks = (text: string) => {
    const words = text.split(/\s+/);
    const indices = words.map((_, i) => i).sort(() => Math.random() - 0.5);
    const count = Math.max(2, Math.floor(words.length * 0.3));
    setHiddenWords(new Set(indices.slice(0, count)));
    setSolvedBlanks(new Set());
    setRevealedWrong(new Set());
    setActiveBlank(null);
    setUserInput("");
  };

  const verse = verses[currentIndex];
  const words = useMemo(() => verse?.text.split(/\s+/) || [], [verse]);

  const handleBlankClick = (idx: number) => {
    if (solvedBlanks.has(idx)) return;
    setActiveBlank(idx);
    setUserInput("");
  };

  const handleSubmitWord = () => {
    if (activeBlank === null) return;
    const target = words[activeBlank].replace(/[.,;:!?"'""'']/g, "").toLowerCase();
    const guess = userInput.trim().toLowerCase();
    if (guess === target) {
      setSolvedBlanks((s) => new Set([...s, activeBlank]));
      setScore((s) => s + 1);
      setActiveBlank(null);
      setUserInput("");

      const allSolved = [...hiddenWords].every((i) => solvedBlanks.has(i) || i === activeBlank);
      if (allSolved) {
        if (currentIndex + 1 >= verses.length) {
          addManna(score + 1);
          setFinished(true);
        } else {
          setTimeout(() => {
            const next = currentIndex + 1;
            setCurrentIndex(next);
            generateBlanks(verses[next].text);
          }, 800);
        }
      }
    } else {
      setRevealedWrong((s) => new Set([...s, activeBlank]));
      setTimeout(() => setRevealedWrong((s) => { const n = new Set(s); n.delete(activeBlank!); return n; }), 600);
    }
  };

  if (loading) return (
    <div className="text-center py-12">
      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
    </div>
  );

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h3 className="font-display text-2xl mb-2 text-foreground">Memory Master!</h3>
        <p className="text-muted-foreground font-body mb-2">You filled in {score} blanks correctly</p>
        <div className="flex items-center justify-center gap-1 mb-6">
          <Sparkles size={14} className="text-primary" />
          <span className="font-body text-sm text-primary">+{score} Manna earned!</span>
        </div>
        <Button onClick={() => { loadVerses(); setCurrentIndex(0); setScore(0); setFinished(false); }} className="gap-2 bg-primary text-primary-foreground">
          <RotateCcw size={16} /> Play Again
        </Button>
      </motion.div>
    );
  }

  if (!verse) return <p className="text-center text-muted-foreground font-body">No verses available.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground font-body">{currentIndex + 1} / {verses.length}</span>
        <span className="text-sm font-body font-medium text-primary">🧠 {score}</span>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-3">{verse.reference}</p>
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 leading-relaxed">
        {words.map((word, i) => {
          if (hiddenWords.has(i)) {
            if (solvedBlanks.has(i)) {
              return <span key={i} className="inline-block px-1 font-body text-primary font-semibold">{word} </span>;
            }
            return (
              <button
                key={i}
                onClick={() => handleBlankClick(i)}
                className={`inline-block px-2 py-0.5 mx-0.5 rounded border-2 border-dashed font-body text-sm transition-all ${
                  activeBlank === i ? "border-primary bg-primary/10" :
                  revealedWrong.has(i) ? "border-destructive bg-destructive/10" :
                  "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                {"_".repeat(Math.min(word.length, 8))}
              </button>
            );
          }
          return <span key={i} className="font-body text-foreground">{word} </span>;
        })}
      </div>

      {activeBlank !== null && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          <input
            autoFocus
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitWord()}
            placeholder="Type the missing word…"
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleSubmitWord} size="sm" className="bg-primary text-primary-foreground">Check</Button>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryVerseGame;
