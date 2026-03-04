import { Mood, moodEmojis, moodLabels, moodColors } from "@/data/bibleVerses";
import { motion } from "framer-motion";

const moods: Mood[] = ["happy", "sad", "anxious", "grateful", "angry", "lonely", "hopeful", "tired"];

interface MoodSelectorProps {
  onSelect: (mood: Mood) => void;
}

const MoodSelector = ({ onSelect }: MoodSelectorProps) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="font-display text-2xl text-center mb-2 text-foreground">How are you feeling?</h2>
      <p className="text-center text-muted-foreground mb-8 font-body">
        Be honest — God already knows 💛
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {moods.map((mood, i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            onClick={() => onSelect(mood)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${moodColors[mood]} cursor-pointer`}
          >
            <span className="text-3xl">{moodEmojis[mood]}</span>
            <span className="text-sm font-body font-medium text-foreground">{moodLabels[mood]}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
