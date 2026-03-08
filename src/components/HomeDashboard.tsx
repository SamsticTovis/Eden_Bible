import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, Gamepad2, Sparkles, ChevronRight, Flame, Users, MessageCircle, Clock, Trophy } from "lucide-react";
import SpiritualGoals from "./SpiritualGoals";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStreak } from "@/hooks/useStreak";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { getManna } from "./MannaTracker";
import type { AppTab } from "./BottomNav";

interface HomeDashboardProps {
  onNavigate: (tab: AppTab) => void;
  onOpenAIChat?: () => void;
  onOpenPrayerCircles?: () => void;
}

interface RecentActivity {
  id: string;
  activity_type: string;
  description: string;
  icon: string;
  created_at: string;
}

interface Devotional {
  verse: string;
  reference: string;
  explanation: string;
  prayer: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Gamepad2,
  Users,
  MessageCircle,
  Heart,
};

const greetings = [
  "Peace be with you",
  "God's grace is upon you",
  "You are loved beyond measure",
  "Walk in faith today",
];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const HomeDashboard = ({ onNavigate, onOpenAIChat, onOpenPrayerCircles }: HomeDashboardProps) => {
  const { user } = useAuth();
  const { streak } = useStreak();
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({ gamesPlayed: 0, circlesJoined: 0 });
  const manna = getManna();
  const { unlocked, checkAchievements } = useAchievements();

  // Fetch daily devotional from Bible API
  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        // Get verse of the day from the verses table
        const { data } = await supabase
          .from("verses")
          .select("text, reference")
          .limit(50);
        if (data && data.length > 0) {
          const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
          );
          const verse = data[dayOfYear % data.length];

          // Generate explanation and prayer based on the verse
          const explanations: Record<string, { explanation: string; prayer: string }> = {};
          // Simple fallback devotional content
          setDevotional({
            verse: verse.text,
            reference: verse.reference,
            explanation: getExplanation(verse.reference),
            prayer: getPrayer(verse.reference),
          });
        }
      } catch (err) {
        console.error("Failed to load devotional:", err);
      }
    };
    fetchDevotional();
  }, []);

  // Fetch recent activity
  useEffect(() => {
    if (!user) return;
    const loadActivity = async () => {
      const { data } = await supabase
        .from("recent_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setActivities(data as RecentActivity[]);
    };
    loadActivity();
  }, [user]);

  // Fetch stats and check achievements
  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      const [profileRes, circlesRes] = await Promise.all([
        supabase.from("profiles").select("games_won, chapters_read").eq("id", user.id).single(),
        supabase.from("circle_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      const gamesPlayed = profileRes.data?.games_won || 0;
      const circlesJoined = circlesRes.count || 0;
      const chaptersRead = profileRes.data?.chapters_read || 0;
      setStats({ gamesPlayed, circlesJoined });

      // Check achievements based on current stats
      checkAchievements({
        chaptersRead,
        streak,
        circlesJoined,
        gamesWon: gamesPlayed,
      });
    };
    loadStats();
  }, [user, streak, checkAchievements]);

  const quickActions = [
    { label: "Read Bible", desc: "Explore God's Word", icon: BookOpen, action: () => onNavigate("read") },
    { label: "Play Games", desc: "Learn while having fun", icon: Gamepad2, action: () => onNavigate("games") },
    { label: "Prayer Circle", desc: "Pray with others", icon: Users, action: () => onOpenPrayerCircles?.() },
    { label: "Ask Eden AI", desc: "Spiritual guidance", icon: MessageCircle, action: () => onOpenAIChat?.() },
  ];

  const statCards = [
    { label: "Manna", value: manna, icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
    { label: "Streak", value: `${streak} days`, icon: Flame, color: "text-accent", bg: "bg-accent/10" },
    { label: "Games", value: stats.gamesPlayed, icon: Gamepad2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Circles", value: stats.circlesJoined, icon: Users, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-display text-2xl text-foreground mb-1">Welcome to Eden</h2>
        <p className="font-body text-sm text-muted-foreground">{greeting} ✨</p>
      </motion.div>

      {/* SECTION 1 — User Progress Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border shadow-soft"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <span className="font-display text-base text-foreground leading-tight">{stat.value}</span>
            <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* SECTION 2 — Daily Devotional */}
      {devotional && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft"
        >
          <div className="bg-primary/5 px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider">
                Daily Devotional
              </span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {/* Verse */}
            <div>
              <p className="font-body text-xs text-primary font-semibold mb-1.5">{devotional.reference}</p>
              <p className="font-display text-lg text-foreground italic leading-relaxed">
                "{devotional.verse}"
              </p>
            </div>
            {/* Explanation */}
            <div className="bg-muted/50 rounded-xl p-3.5">
              <p className="font-body text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                Reflection
              </p>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">
                {devotional.explanation}
              </p>
            </div>
            {/* Prayer */}
            <div className="bg-primary/5 rounded-xl p-3.5">
              <p className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider mb-1">
                Prayer
              </p>
              <p className="font-body text-sm text-foreground/80 italic leading-relaxed">
                "{devotional.prayer}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION — Spiritual Goals & Progress */}
      <SpiritualGoals />

      {/* SECTION 3 — Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-display text-base text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={action.action}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border shadow-soft hover:shadow-warm hover:border-primary/20 transition-all active:scale-[0.97] group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <action.icon size={22} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-display text-sm text-foreground">{action.label}</p>
                <p className="font-body text-[10px] text-muted-foreground">{action.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* SECTION — Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-primary" />
          <h3 className="font-display text-base text-foreground">Achievements</h3>
        </div>
        {unlocked.size === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-soft">
            <p className="font-body text-sm text-muted-foreground">
              Complete activities to unlock achievements! 🏆
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENTS.filter((a) => unlocked.has(a.key)).map((a, i) => (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-primary/20 shadow-soft"
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="font-body text-[10px] text-foreground font-medium text-center leading-tight">{a.name}</span>
              </motion.div>
            ))}
          </div>
        )}
        {/* Locked preview */}
        {unlocked.size > 0 && unlocked.size < ACHIEVEMENTS.length && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ACHIEVEMENTS.filter((a) => !unlocked.has(a.key)).map((a) => (
              <span
                key={a.key}
                className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-body text-[10px]"
                title={a.description}
              >
                🔒 {a.name}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-display text-base text-foreground mb-3">Recent Activity</h3>
        {activities.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-soft">
            <Clock size={24} className="text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-body text-sm text-muted-foreground">
              Your activity will appear here
            </p>
            <p className="font-body text-xs text-muted-foreground/70 mt-1">
              Read a chapter, play a game, or pray with others
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, i) => {
              const IconComp = ICON_MAP[activity.icon] || BookOpen;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-soft"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <IconComp size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground truncate">{activity.description}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{timeAgo(activity.created_at)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Simple devotional helpers — generates contextual reflections
function getExplanation(reference: string): string {
  const explanations = [
    "God works even through our most difficult moments, weaving every experience into His greater purpose for our lives.",
    "This verse reminds us that we are never alone — God's presence surrounds us in every season.",
    "When fear and doubt creep in, God invites us to trust in His unfailing love and perfect plan.",
    "The Lord calls us to rest in His promises, knowing that His faithfulness never wavers.",
    "Even in the valley, God walks beside us. His Word is a lamp that lights our path forward.",
    "True strength comes not from our own effort, but from surrendering to God's mighty power within us.",
    "God's love is not something we earn — it's a gift freely given, poured out without measure.",
  ];
  // Use reference hash for consistency
  const hash = reference.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return explanations[hash % explanations.length];
}

function getPrayer(reference: string): string {
  const prayers = [
    "Lord, help me trust Your plan today. Give me eyes to see Your hand at work in every moment. Amen.",
    "Father, fill me with Your peace that surpasses understanding. Guard my heart and mind in Christ Jesus. Amen.",
    "God, strengthen my faith when I feel weak. Remind me that Your grace is sufficient for all things. Amen.",
    "Lord, open my heart to receive Your Word today. Let it take root and bear fruit in my life. Amen.",
    "Father, help me walk in love today — the kind of love that is patient, kind, and never fails. Amen.",
    "God, I surrender my worries to You. Teach me to cast every care upon You, knowing You care for me. Amen.",
    "Lord, use me today as an instrument of Your peace. Let my words and actions reflect Your glory. Amen.",
  ];
  const hash = reference.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return prayers[hash % prayers.length];
}

export default HomeDashboard;
