import { useState } from "react";
import { Menu } from "lucide-react";
import BottomNav, { AppTab } from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import FullBibleReader from "@/components/FullBibleReader";
import ComfortPage from "@/components/ComfortPage";
import GamesHub from "@/components/GamesHub";
import JourneyPage from "@/components/JourneyPage";
import SettingsPage from "@/components/SettingsPage";
import FloatingAssistant from "@/components/FloatingAssistant";
import AIComfortChat from "@/components/AIComfortChat";
import SideDrawer from "@/components/SideDrawer";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [tab, setTab] = useState<AppTab>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleOpenSettings = () => {
    setShowSettings(true);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 pt-8 pb-3 max-w-lg mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-xl text-foreground"
          >
            Eden Bible ✨
          </motion.h1>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu size={22} className="text-foreground" />
          </button>
        </div>
      </header>

      {/* Side Drawer */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSettings={handleOpenSettings}
      />

      {/* Floating assistant */}
      <FloatingAssistant onTap={() => setShowAIChat(true)} />

      {/* Content */}
      <main className="px-5 py-6">
        <AnimatePresence mode="wait">
          {showAIChat ? (
            <motion.div key="ai-chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AIComfortChat onClose={() => setShowAIChat(false)} />
            </motion.div>
          ) : showSettings ? (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => setShowSettings(false)}
                className="text-primary font-body text-sm mb-4 flex items-center gap-1"
              >
                ← Back
              </button>
              <SettingsPage />
            </motion.div>
          ) : (
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={(t) => { setShowAIChat(false); setShowSettings(false); setTab(t); }} />
    </div>
  );
};

export default Index;
