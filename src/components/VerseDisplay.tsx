import { BibleVerse, Mood, moodEmojis, moodLabels, getRandomVerse } from "@/data/bibleVerses";
import { motion } from "framer-motion";
import { RefreshCw, ArrowLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VerseDisplayProps {
  mood: Mood;
  onBack: () => void;
}

const VerseDisplay = ({ mood, onBack }: VerseDisplayProps) => {
  const [verse, setVerse] = useState<BibleVerse>(getRandomVerse(mood));

  const handleShare = async () => {
    const text = `"${verse.text}" — ${verse.reference}`;
    if (navigator.share) await navigator.share({ text });
    else { await navigator.clipboard.writeText(text); toast.success("Verse copied!"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-body text-sm">
        <ArrowLeft size={16} /> Choose another mood
      </button>

      <div className="text-center mb-4">
        <span className="text-3xl">{moodEmojis[mood]}</span>
        <p className="text-muted-foreground font-body text-sm mt-1">Feeling {moodLabels[mood].toLowerCase()}</p>
      </div>

      <motion.div key={verse.reference} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 shadow-soft"
      >
        <p className="font-display text-lg leading-relaxed text-foreground/90 italic mb-3">"{verse.text}"</p>
        <p className="text-primary font-body font-semibold text-base mb-4">— {verse.reference}</p>
        <div className="bg-gradient-golden rounded-xl p-4">
          <p className="font-body text-foreground/70 leading-relaxed text-sm">{verse.reflection}</p>
        </div>
      </motion.div>

      <div className="flex gap-3 justify-center mt-5">
        <Button variant="outline" size="sm" onClick={() => setVerse(getRandomVerse(mood))} className="gap-2 font-body glass border-0">
          <RefreshCw size={14} /> Another verse
        </Button>
        <Button size="sm" onClick={handleShare} className="gap-2 font-body bg-primary/15 text-primary hover:bg-primary/25 border-0">
          <Share2 size={14} /> Share
        </Button>
      </div>
    </motion.div>
  );
};

export default VerseDisplay;
