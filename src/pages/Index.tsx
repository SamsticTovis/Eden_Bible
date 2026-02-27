import { useState } from "react";
import { Mood } from "@/data/bibleVerses";
import BottomNav, { AppTab } from "@/components/BottomNav";
import MoodSelector from "@/components/MoodSelector";
import VerseDisplay from "@/components/VerseDisplay";
import BibleTrivia from "@/components/BibleTrivia";
import CommitmentTracker from "@/components/CommitmentTracker";
import CameraScanner from "@/components/CameraScanner";
import heroImage from "@/assets/hero-sunrise.png";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [tab, setTab] = useState<AppTab>("mood");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Warm sunrise" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-warm" style={{ opacity: 0.7 }} />
        </div>
        <div className="relative px-6 pt-10 pb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl sm:text-4xl text-foreground mb-1"
          >
            SoulShine ✨
          </motion.h1>
          <p className="font-body text-muted-foreground text-sm">
            God's Word for every moment
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + (selectedMood || "")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tab === "mood" && !selectedMood && (
              <MoodSelector onSelect={setSelectedMood} />
            )}
            {tab === "mood" && selectedMood && (
              <VerseDisplay mood={selectedMood} onBack={() => setSelectedMood(null)} />
            )}
            {tab === "camera" && <CameraScanner />}
            {tab === "games" && (
              <div>
                <h2 className="font-display text-2xl text-center mb-2 text-foreground">Bible Trivia</h2>
                <p className="text-center text-muted-foreground font-body mb-8 text-sm">Test your knowledge — it's fun, not a test! 🎯</p>
                <BibleTrivia />
              </div>
            )}
            {tab === "tracker" && (
              <div>
                <h2 className="font-display text-2xl text-center mb-2 text-foreground">Your Journey</h2>
                <p className="text-center text-muted-foreground font-body mb-8 text-sm">Small steps, big faith 🌱</p>
                <CommitmentTracker />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={(t) => { setTab(t); setSelectedMood(null); }} />
    </div>
  );
};

export default Index;
