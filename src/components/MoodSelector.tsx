import { Mood, moodEmojis, moodLabels } from "@/data/bibleVerses";
import { motion } from "framer-motion";

const moods: Mood[] = ["happy", "sad", "anxious", "grateful", "angry", "lonely", "hopeful", "tired"];

interface MoodSelectorProps {
  onSelect: (mood: Mood) => void;
}

const MoodSelector = ({ onSelect }: MoodSelectorProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="font-display text-xl text-center mb-1 text-foreground font-bold">How are you feeling?</h2>
      <p className="text-center text-muted-foreground mb-6 font-body text-sm">Be honest — God already knows 💛</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {moods.map((mood, i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(mood)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl glass hover:border-primary/30 transition-all cursor-pointer active:scale-95"
          >
            <span className="text-2xl">{moodEmojis[mood]}</span>
            <span className="text-xs font-body font-medium text-foreground/80">{moodLabels[mood]}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
