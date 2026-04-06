import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RANKS = [
  "Seed", "Shepherd", "Disciple", "Prophet", "Apostle",
  "Evangelist", "Watchman", "Anointed", "Kingdom Elite", "Throne Bearer",
];

const MANNA_REWARDS: Record<string, { min: number; max: number }> = {
  easy: { min: 5, max: 10 },
  medium: { min: 15, max: 25 },
  hard: { min: 30, max: 50 },
  expert: { min: 40, max: 60 },
};

const MAX_SESSION_MANNA = 500;
const MIN_MANNA_INTERVAL_MS = 10000; // 10 seconds between manna awards

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, ...params } = await req.json();

    // --- RECORD GAME RESULT (anti-cheat + manna award) ---
    if (action === "record_game") {
      const { user_id, difficulty, won } = params;
      if (!user_id || !difficulty) throw new Error("Missing user_id or difficulty");

      const diff = difficulty.toLowerCase();
      const reward = MANNA_REWARDS[diff];
      if (!reward) throw new Error("Invalid difficulty");

      // Get current entry
      const { data: entry } = await supabaseAdmin
        .from("leaderboard_entries")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();

      if (!entry) throw new Error("No leaderboard entry found");

      // Anti-cheat: check time since last manna earned
      const now = Date.now();
      if (entry.last_manna_earned_at) {
        const lastTime = new Date(entry.last_manna_earned_at).getTime();
        if (now - lastTime < MIN_MANNA_INTERVAL_MS) {
          return new Response(JSON.stringify({ error: "Too fast. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Anti-cheat: session cap
      const sessionStart = new Date(entry.session_started_at || now).getTime();
      const hoursSinceSessionStart = (now - sessionStart) / (1000 * 60 * 60);
      let sessionManna = entry.session_manna || 0;
      if (hoursSinceSessionStart > 1) {
        sessionManna = 0; // reset session after 1 hour
      }
      if (sessionManna >= MAX_SESSION_MANNA) {
        return new Response(JSON.stringify({ error: "Session manna cap reached. Take a break!" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const mannaEarned = won
        ? Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min
        : Math.floor(reward.min / 2); // partial reward for playing

      const newSessionManna = sessionManna + mannaEarned;

      await supabaseAdmin.from("leaderboard_entries").update({
        total_manna: (entry.total_manna || 0) + mannaEarned,
        weekly_manna: (entry.weekly_manna || 0) + mannaEarned,
        games_played: (entry.games_played || 0) + 1,
        last_manna_earned_at: new Date().toISOString(),
        session_manna: newSessionManna,
        session_started_at: hoursSinceSessionStart > 1 ? new Date().toISOString() : entry.session_started_at,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user_id);

      return new Response(JSON.stringify({ manna_earned: mannaEarned, total: (entry.total_manna || 0) + mannaEarned }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- WEEKLY RESET + PROMOTION ---
    if (action === "weekly_reset") {
      // Get all entries sorted by weekly_manna desc
      const { data: allEntries } = await supabaseAdmin
        .from("leaderboard_entries")
        .select("*")
        .order("weekly_manna", { ascending: false });

      if (!allEntries) throw new Error("No entries found");

      // Group by rank
      const byRank: Record<string, typeof allEntries> = {};
      for (const e of allEntries) {
        if (!byRank[e.current_rank]) byRank[e.current_rank] = [];
        byRank[e.current_rank].push(e);
      }

      // Promote top 50 per rank
      for (const rank of RANKS) {
        const rankIdx = RANKS.indexOf(rank);
        if (rankIdx >= RANKS.length - 1) continue; // can't promote Throne Bearer
        const playersInRank = byRank[rank] || [];
        const top50 = playersInRank.slice(0, 50);

        for (const player of top50) {
          if (player.weekly_manna > 0) {
            await supabaseAdmin.from("leaderboard_entries").update({
              last_week_rank: player.current_rank,
              current_rank: RANKS[rankIdx + 1],
            }).eq("id", player.id);
          }
        }
      }

      // Reset weekly manna for all
      await supabaseAdmin.from("leaderboard_entries").update({
        weekly_manna: 0,
        week_start: new Date().toISOString(),
        session_manna: 0,
      }).neq("id", "00000000-0000-0000-0000-000000000000"); // update all

      // Simulate bot activity for next week
      const { data: bots } = await supabaseAdmin
        .from("leaderboard_entries")
        .select("*")
        .eq("is_bot", true);

      if (bots) {
        for (const bot of bots) {
          const weeklyManna = Math.floor(Math.random() * 300) + 50;
          const gamesPlayed = Math.floor(Math.random() * 20) + 5;
          await supabaseAdmin.from("leaderboard_entries").update({
            weekly_manna: weeklyManna,
            total_manna: (bot.total_manna || 0) + weeklyManna,
            games_played: (bot.games_played || 0) + gamesPlayed,
          }).eq("id", bot.id);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
