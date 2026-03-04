import { useState } from "react";
import { Mood } from "@/data/bibleVerses";
import BottomNav, { AppTab } from "@/components/BottomNav";
import MoodSelector from "@/components/MoodSelector";
import VerseDisplay from "@/components/VerseDisplay";
import BibleReader from "@/components/BibleReader";
import GamesHub from "@/components/GamesHub";
import CommitmentTracker from "@/components/CommitmentTracker";
import CameraScanner from "@/components/CameraScanner";
import EdenMascot from "@/components/EdenMascot";
import MannaTracker from "@/components/MannaTracker";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [tab, setTab] = useState<AppTab>("mood");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Eden + Manna */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 pt-8 pb-1">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-xl text-foreground"
          >
            Eden Bible ✨
          </motion.h1>
          <MannaTracker />
        </div>
        <EdenMascot tab={tab} />
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
            {tab === "read" && <BibleReader />}
            {tab === "camera" && <CameraScanner />}
            {tab === "games" && <GamesHub />}
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
