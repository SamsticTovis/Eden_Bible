import { useState } from "react";
import { Mood } from "@/data/bibleVerses";
import MoodSelector from "./MoodSelector";
import VerseDisplay from "./VerseDisplay";
import { motion } from "framer-motion";

const ComfortPage = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  return (
    <div className="max-w-md mx-auto">
      {!selectedMood ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="font-display text-2xl text-center mb-1 text-foreground">Find Comfort</h2>
          <p className="text-center text-muted-foreground font-body mb-6 text-sm">
            How are you feeling? Let God speak to your heart 💛
          </p>
          <MoodSelector onSelect={setSelectedMood} />
        </motion.div>
      ) : (
        <VerseDisplay mood={selectedMood} onBack={() => setSelectedMood(null)} />
      )}
    </div>
  );
};

export default ComfortPage;
