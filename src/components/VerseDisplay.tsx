import { BibleVerse, Mood, moodEmojis, moodLabels } from "@/data/bibleVerses";
import { getRandomVerse } from "@/data/bibleVerses";
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

  const handleNewVerse = () => {
    setVerse(getRandomVerse(mood));
  };

  const handleShare = async () => {
    const text = `"${verse.text}" — ${verse.reference}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Verse copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-body">
        <ArrowLeft size={18} />
        <span>Choose another mood</span>
      </button>

      <div className="text-center mb-4">
        <span className="text-4xl">{moodEmojis[mood]}</span>
        <p className="text-muted-foreground font-body mt-1">Feeling {moodLabels[mood].toLowerCase()}</p>
      </div>

      <motion.div
        key={verse.reference}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl p-8 shadow-warm border border-border"
      >
        <p className="font-display text-xl sm:text-2xl leading-relaxed text-foreground italic mb-4">
          "{verse.text}"
        </p>
        <p className="text-primary font-body font-semibold text-lg mb-6">— {verse.reference}</p>
        <div className="bg-gradient-golden rounded-xl p-4">
          <p className="font-body text-foreground/80 leading-relaxed">{verse.reflection}</p>
        </div>
      </motion.div>

      <div className="flex gap-3 justify-center mt-6">
        <Button variant="outline" size="lg" onClick={handleNewVerse} className="gap-2 font-body">
          <RefreshCw size={16} />
          Another verse
        </Button>
        <Button size="lg" onClick={handleShare} className="gap-2 font-body bg-primary text-primary-foreground hover:bg-primary/90">
          <Share2 size={16} />
          Share
        </Button>
      </div>
    </motion.div>
  );
};

export default VerseDisplay;
