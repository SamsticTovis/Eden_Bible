import { useState, useCallback } from "react";
import EdenMascot, { EdenMood } from "@/components/EdenMascot";
import SmartSearch from "@/components/SmartSearch";
import BibleReaderView from "@/components/BibleReaderView";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import GamesDrawer from "@/components/GamesDrawer";
import MoodScanOverlay from "@/components/MoodScanOverlay";
import TranslationPicker from "@/components/TranslationPicker";
import { motion } from "framer-motion";

const Index = () => {
  const [translation, setTranslation] = useState("BSB");
  const [activeChapter, setActiveChapter] = useState<{ book: string; chapter: number } | null>(null);
  const [edenMessage, setEdenMessage] = useState<string | undefined>();
  const [edenMood, setEdenMood] = useState<EdenMood>("default");
  const [moodScanOpen, setMoodScanOpen] = useState(false);

  const handleLoadChapter = useCallback((book: string, chapter: number) => {
    setActiveChapter({ book, chapter });
  }, []);

  const handleChapterChange = useCallback((bookId: string, chapter: number) => {
    setActiveChapter({ book: bookId, chapter });
  }, []);

  const handleEdenMessage = useCallback((msg: string) => {
    setEdenMessage(msg);
  }, []);

  const handleGameReact = useCallback((mood: "happy" | "thinking" | "cheering" | "sad", message: string) => {
    setEdenMood(mood);
    setEdenMessage(message);
    setTimeout(() => setEdenMood("default"), 3000);
  }, []);

  const handleMoodReact = useCallback((mood: "happy" | "sad", message: string) => {
    setEdenMood(mood);
    setEdenMessage(message);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top: Eden + Settings */}
      <header className="bg-card border-b-2 border-border sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 pt-6 pb-0">
            <div className="flex-1" />
            <TranslationPicker value={translation} onChange={setTranslation} />
          </div>
          <EdenMascot
            message={edenMessage}
            mood={edenMood}
            onScanMood={() => setMoodScanOpen(true)}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-8">
        {/* Smart Search */}
        <SmartSearch onLoadChapter={handleLoadChapter} translation={translation} />

        {/* Reader or VOTD */}
        <div className="mt-4">
          {activeChapter ? (
            <motion.div key={`${activeChapter.book}-${activeChapter.chapter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setActiveChapter(null)}
                  className="text-primary font-body font-bold text-sm hover:underline"
                >
                  ← Back to Home
                </button>
              </div>
              <BibleReaderView
                book={activeChapter.book}
                chapter={activeChapter.chapter}
                translation={translation}
                onChapterChange={handleChapterChange}
                onEdenMessage={handleEdenMessage}
              />
            </motion.div>
          ) : (
            <VerseOfTheDay />
          )}
        </div>

        {/* Games */}
        <GamesDrawer onEdenReact={handleGameReact} />
      </main>

      {/* Mood Scan Overlay */}
      <MoodScanOverlay
        open={moodScanOpen}
        onClose={() => setMoodScanOpen(false)}
        onEdenReact={handleMoodReact}
      />
    </div>
  );
};

export default Index;
