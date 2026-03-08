import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Gamepad2, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AppTab } from "./BottomNav";
import MannaTracker from "./MannaTracker";

interface HomeDashboardProps {
  onNavigate: (tab: AppTab) => void;
}

const greetings = [
  "Peace be with you",
  "God's grace is upon you",
  "You are loved beyond measure",
  "Walk in faith today",
];

const HomeDashboard = ({ onNavigate }: HomeDashboardProps) => {
  const [dailyVerse, setDailyVerse] = useState<{ text: string; reference: string } | null>(null);
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);

  useEffect(() => {
    const fetchDaily = async () => {
      const { data } = await supabase
        .from("verses")
        .select("text, reference")
        .limit(20);
      if (data && data.length > 0) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setDailyVerse(data[dayOfYear % data.length]);
      }
    };
    fetchDaily();
  }, []);

  const quickActions = [
    { label: "Read Bible", desc: "Explore God's Word", icon: BookOpen, tab: "read" as AppTab },
    { label: "Find Comfort", desc: "Verses for your heart", icon: Heart, tab: "comfort" as AppTab },
    { label: "Play Games", desc: "Learn while having fun", icon: Gamepad2, tab: "games" as AppTab },
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="font-display text-2xl text-foreground mb-1">Welcome to Eden</h2>
        <p className="font-body text-sm text-muted-foreground">{greeting} ✨</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <MannaTracker />
      </motion.div>

      {/* Daily Verse */}
      {dailyVerse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-primary" />
            <span className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider">Verse of the Day</span>
          </div>
          <p className="font-display text-lg text-foreground italic leading-relaxed mb-3">
            "{dailyVerse.text}"
          </p>
          <p className="font-body text-sm text-primary font-medium">— {dailyVerse.reference}</p>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-col gap-2.5">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            onClick={() => onNavigate(action.tab)}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm hover:border-primary/20 transition-all active:scale-[0.98] text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
              <action.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base text-foreground">{action.label}</h3>
              <p className="font-body text-xs text-muted-foreground">{action.desc}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HomeDashboard;
