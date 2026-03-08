import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu } from "lucide-react";
import BottomNav, { AppTab } from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import FullBibleReader from "@/components/FullBibleReader";
import ComfortPage from "@/components/ComfortPage";
import GamesHub from "@/components/GamesHub";
import JourneyPage from "@/components/JourneyPage";
import SermonsPage from "@/components/SermonsPage";
import SettingsPage from "@/components/SettingsPage";
import FloatingAssistant from "@/components/FloatingAssistant";
import AIComfortChat from "@/components/AIComfortChat";
import SideDrawer from "@/components/SideDrawer";
import AuthPage from "@/components/AuthPage";
import PrayerCircles from "@/components/PrayerCircles";
import ProfilePage from "@/components/ProfilePage";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const tabSwitch = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const Index = () => {
  const { user, loading, signOut, isGuest, requireAuth } = useAuth();
  const [tab, setTab] = useState<AppTab>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPrayerCircles, setShowPrayerCircles] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-muted-foreground">Loading Eden...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  const handleOpenSettings = () => {
    setShowSettings(true);
    setShowPrayerCircles(false);
    setDrawerOpen(false);
  };

  const handleDrawerAction = (action: string) => {
    if (action === "settings") handleOpenSettings();
    else if (action === "profile") {
      if (!requireAuth("view your profile")) return;
      setShowProfile(true);
      setShowSettings(false);
      setShowPrayerCircles(false);
      setShowAIChat(false);
      setDrawerOpen(false);
    } else if (action === "prayer-circles") {
      if (!requireAuth("join prayer circles")) return;
      setShowPrayerCircles(true);
      setShowSettings(false);
      setShowProfile(false);
      setShowAIChat(false);
      setDrawerOpen(false);
    } else if (action === "delete-account") {
      handleDeleteAccount();
    } else if (action === "logout") {
      signOut();
      setDrawerOpen(false);
    } else {
      setDrawerOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await supabase.auth.signOut();
      localStorage.removeItem("eden-guest-session");
      localStorage.removeItem("eden-manna");
      localStorage.removeItem("eden-streak");
      localStorage.removeItem("eden-last-login");
    } catch (e: any) {
      const { toast } = await import("@/hooks/use-toast");
      toast({ title: "Error", description: e.message || "Failed to delete account." });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-5 pt-8 pb-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xl text-foreground tracking-tight"
            >
              Eden Bible
            </motion.h1>
            {isGuest && (
              <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-body text-[10px] font-medium uppercase tracking-wider">
                Guest
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors active:scale-95"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSettings={handleOpenSettings}
        onAction={handleDrawerAction}
      />

      <FloatingAssistant onTap={() => setShowAIChat(true)} />

      <main className="px-5 py-6">
        <AnimatePresence mode="wait">
          {showAIChat ? (
            <motion.div key="ai-chat" {...slideIn}>
              <AIComfortChat onClose={() => setShowAIChat(false)} />
            </motion.div>
          ) : showProfile ? (
            <motion.div key="profile" {...slideIn}>
              <ProfilePage onBack={() => setShowProfile(false)} />
            </motion.div>
          ) : showPrayerCircles ? (
            <motion.div key="prayer-circles" {...slideIn}>
              <PrayerCircles onBack={() => setShowPrayerCircles(false)} />
            </motion.div>
          ) : showSettings ? (
            <motion.div key="settings" {...slideIn}>
              <button
                onClick={() => setShowSettings(false)}
                className="text-primary font-body text-sm mb-4 flex items-center gap-1 hover:underline"
              >
                ← Back
              </button>
              <SettingsPage />
            </motion.div>
          ) : (
            <motion.div key={tab} {...tabSwitch}>
              {tab === "home" && (
                <HomeDashboard
                  onNavigate={setTab}
                  onOpenAIChat={() => setShowAIChat(true)}
                  onOpenPrayerCircles={() => {
                    if (!requireAuth("join prayer circles")) return;
                    setShowPrayerCircles(true);
                    setShowSettings(false);
                    setShowProfile(false);
                    setShowAIChat(false);
                  }}
                />
              )}
              {tab === "read" && <FullBibleReader />}
              {tab === "comfort" && <ComfortPage />}
              {tab === "games" && <GamesHub />}
              {tab === "journey" && <JourneyPage />}
              {tab === "sermons" && <SermonsPage />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={(t) => { setShowAIChat(false); setShowSettings(false); setShowPrayerCircles(false); setShowProfile(false); setTab(t); }} />
    </div>
  );
};

export default Index;
