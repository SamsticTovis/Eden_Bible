import { useState } from "react";
import BottomNav, { AppTab } from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import FullBibleReader from "@/components/FullBibleReader";
import ComfortPage from "@/components/ComfortPage";
import GamesHub from "@/components/GamesHub";
import JourneyPage from "@/components/JourneyPage";
import SettingsPage from "@/components/SettingsPage";
import FloatingAssistant from "@/components/FloatingAssistant";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [tab, setTab] = useState<AppTab>("home");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-center px-4 pt-8 pb-3">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-xl text-foreground"
          >
            Eden Bible ✨
          </motion.h1>
        </div>
      </header>

      {/* Floating assistant */}
      <FloatingAssistant />

      {/* Content */}
      <main className="px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "home" && <HomeDashboard onNavigate={setTab} />}
            {tab === "read" && <FullBibleReader />}
            {tab === "comfort" && <ComfortPage />}
            {tab === "games" && <GamesHub />}
            {tab === "journey" && <JourneyPage />}
            {tab === "settings" && <SettingsPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
