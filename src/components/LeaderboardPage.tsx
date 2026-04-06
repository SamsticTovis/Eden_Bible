import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Crown, Medal, Star, ChevronUp, ChevronDown, Minus, Shield, Flame, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  is_bot: boolean;
  total_manna: number;
  weekly_manna: number;
  current_rank: string;
  last_week_rank: string | null;
  games_played: number;
}

const RANKS = [
  "Seed", "Shepherd", "Disciple", "Prophet", "Apostle",
  "Evangelist", "Watchman", "Anointed", "Kingdom Elite", "Throne Bearer"
];

const RANK_COLORS: Record<string, string> = {
  "Seed": "text-emerald-500",
  "Shepherd": "text-sky-500",
  "Disciple": "text-violet-500",
  "Prophet": "text-amber-500",
  "Apostle": "text-rose-500",
  "Evangelist": "text-teal-500",
  "Watchman": "text-orange-500",
  "Anointed": "text-fuchsia-500",
  "Kingdom Elite": "text-yellow-400",
  "Throne Bearer": "text-yellow-300",
};

const RANK_ICONS: Record<string, string> = {
  "Seed": "🌱", "Shepherd": "🐑", "Disciple": "📖", "Prophet": "🔥",
  "Apostle": "⚡", "Evangelist": "📣", "Watchman": "🛡️", "Anointed": "👑",
  "Kingdom Elite": "🏰", "Throne Bearer": "🪽",
};

const MANNA_REWARDS = {
  Easy: { min: 5, max: 10 },
  Medium: { min: 15, max: 25 },
  Hard: { min: 30, max: 50 },
  Expert: { min: 40, max: 60 },
};

interface LeaderboardPageProps {
  onBack: () => void;
}

type ViewMode = "weekly" | "alltime";
type RankFilter = "all" | string;

const LeaderboardPage = ({ onBack }: LeaderboardPageProps) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [rankFilter, setRankFilter] = useState<RankFilter>("all");
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  const fetchLeaderboard = async () => {
    const sortCol = viewMode === "weekly" ? "weekly_manna" : "total_manna";
    let query = supabase
      .from("leaderboard_entries")
      .select("*")
      .order(sortCol, { ascending: false })
      .limit(100);

    if (rankFilter !== "all") {
      query = query.eq("current_rank", rankFilter);
    }

    const { data } = await query;
    if (data) {
      setEntries(data as LeaderboardEntry[]);
      if (user) {
        const idx = data.findIndex((e: any) => e.user_id === user.id);
        if (idx >= 0) {
          setUserEntry(data[idx] as LeaderboardEntry);
          setUserPosition(idx + 1);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    // Realtime subscription
    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_entries" }, () => {
        fetchLeaderboard();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [viewMode, rankFilter]);

  // Ensure user has a leaderboard entry
  useEffect(() => {
    if (!user) return;
    const ensureEntry = async () => {
      const { data } = await supabase
        .from("leaderboard_entries")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data) {
        const username = user.user_metadata?.full_name || user.email?.split("@")[0] || "Player";
        await supabase.from("leaderboard_entries").insert({
          user_id: user.id,
          username,
          total_manna: 0,
          weekly_manna: 0,
        });
      }
    };
    ensureEntry();
  }, [user]);

  const getPositionIcon = (pos: number) => {
    if (pos === 1) return <Crown size={18} className="text-yellow-400" />;
    if (pos === 2) return <Medal size={18} className="text-gray-300" />;
    if (pos === 3) return <Medal size={18} className="text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground w-[18px] text-center">#{pos}</span>;
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.last_week_rank) return null;
    const cur = RANKS.indexOf(entry.current_rank);
    const prev = RANKS.indexOf(entry.last_week_rank);
    if (cur > prev) return <ChevronUp size={14} className="text-emerald-500" />;
    if (cur < prev) return <ChevronDown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-muted-foreground" />;
  };

  return (
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Trophy size={24} className="text-primary" />
        <h2 className="font-display text-2xl text-foreground">Leaderboard</h2>
      </div>
      <p className="text-muted-foreground font-body text-sm mb-4">Compete, climb ranks, and earn glory!</p>

      {/* Manna Rewards Info */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(MANNA_REWARDS).map(([diff, { min, max }]) => (
          <div key={diff} className="bg-card rounded-xl border border-border p-2 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">{diff}</p>
            <p className="text-sm font-display text-foreground">{min}–{max}</p>
            <p className="text-[10px] text-muted-foreground">manna</p>
          </div>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-3">
        {(["weekly", "alltime"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all ${
              viewMode === mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {mode === "weekly" ? "🔥 This Week" : "⭐ All Time"}
          </button>
        ))}
      </div>

      {/* Rank Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setRankFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all ${
            rankFilter === "all" ? "bg-primary/15 text-primary font-medium" : "bg-muted text-muted-foreground"
          }`}
        >
          All Ranks
        </button>
        {RANKS.map((rank) => (
          <button
            key={rank}
            onClick={() => setRankFilter(rank)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body whitespace-nowrap transition-all flex items-center gap-1 ${
              rankFilter === rank ? "bg-primary/15 text-primary font-medium" : "bg-muted text-muted-foreground"
            }`}
          >
            {RANK_ICONS[rank]} {rank}
          </button>
        ))}
      </div>

      {/* User's Position */}
      {userEntry && userPosition && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center font-display text-sm text-primary">
            #{userPosition}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm text-foreground truncate">You — {userEntry.username}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={RANK_COLORS[userEntry.current_rank]}>
                {RANK_ICONS[userEntry.current_rank]} {userEntry.current_rank}
              </span>
              <span>•</span>
              <span>{viewMode === "weekly" ? userEntry.weekly_manna : userEntry.total_manna} manna</span>
            </div>
          </div>
          {getRankChange(userEntry)}
        </motion.div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-body text-sm">
          No players yet. Be the first!
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {entries.map((entry, i) => {
              const pos = i + 1;
              const isUser = user && entry.user_id === user.id;
              const manna = viewMode === "weekly" ? entry.weekly_manna : entry.total_manna;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isUser
                      ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10"
                      : pos <= 3
                      ? "bg-card border-border shadow-sm"
                      : "bg-card/50 border-border/50"
                  }`}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    {getPositionIcon(pos)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`font-display text-sm truncate ${isUser ? "text-primary" : "text-foreground"}`}>
                        {entry.username}
                        {entry.is_bot && <span className="text-[10px] text-muted-foreground ml-1">🤖</span>}
                      </p>
                      {getRankChange(entry)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className={RANK_COLORS[entry.current_rank]}>
                        {RANK_ICONS[entry.current_rank]} {entry.current_rank}
                      </span>
                      <span>•</span>
                      <span>{entry.games_played} games</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-sm text-foreground">{manna.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">manna</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Rank Progression */}
      <div className="mt-6 bg-card rounded-2xl border border-border p-4">
        <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2">
          <Shield size={16} className="text-primary" /> Rank Progression
        </h3>
        <div className="flex flex-col gap-1.5">
          {RANKS.map((rank, i) => (
            <div
              key={rank}
              className={`flex items-center gap-2 text-xs font-body py-1 px-2 rounded-lg ${
                userEntry?.current_rank === rank ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <span>{RANK_ICONS[rank]}</span>
              <span className="flex-1">{rank}</span>
              <span className="text-[10px]">Tier {i + 1}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Top 50 players per rank promote weekly. Keep earning manna to climb!
        </p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
