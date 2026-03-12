import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is authenticated
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = claimsData.claims.sub;

    // Use service role to check admin status
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    let result: unknown = null;

    switch (action) {
      case "list_users": {
        const { data: users } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const { data: profiles } = await adminClient.from("profiles").select("*");
        const { data: bans } = await adminClient.from("user_bans").select("user_id");
        const { data: circleMembers } = await adminClient.from("circle_members").select("user_id, circle_id");

        const bannedIds = new Set((bans || []).map((b: any) => b.user_id));
        const circleCounts: Record<string, number> = {};
        (circleMembers || []).forEach((cm: any) => {
          circleCounts[cm.user_id] = (circleCounts[cm.user_id] || 0) + 1;
        });

        const profileMap: Record<string, any> = {};
        (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

        result = (users?.users || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          username: profileMap[u.id]?.username || null,
          avatar_url: profileMap[u.id]?.avatar_url || null,
          plan: profileMap[u.id]?.plan || "free",
          reading_streak: profileMap[u.id]?.reading_streak || 0,
          games_won: profileMap[u.id]?.games_won || 0,
          chapters_read: profileMap[u.id]?.chapters_read || 0,
          circles_joined: circleCounts[u.id] || 0,
          is_banned: bannedIds.has(u.id),
        }));
        break;
      }

      case "change_plan": {
        const { user_id, plan } = params as { user_id: string; plan: string };
        const { error } = await adminClient
          .from("profiles")
          .update({ plan })
          .eq("id", user_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "ban_user": {
        const { user_id, reason } = params as { user_id: string; reason?: string };
        const { error } = await adminClient
          .from("user_bans")
          .insert({ user_id, reason, banned_by: callerUserId });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "unban_user": {
        const { user_id } = params as { user_id: string };
        const { error } = await adminClient
          .from("user_bans")
          .delete()
          .eq("user_id", user_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete_user": {
        const { user_id } = params as { user_id: string };
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "reset_streak": {
        const { user_id } = params as { user_id: string };
        const { error } = await adminClient
          .from("profiles")
          .update({ reading_streak: 0 })
          .eq("id", user_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "add_manna": {
        const { user_id, amount, description } = params as { user_id: string; amount: number; description?: string };
        const { error } = await adminClient
          .from("manna_transactions")
          .insert({ user_id, amount, type: "admin_grant", description: description || "Admin grant", created_by: callerUserId });
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "get_analytics": {
        const { data: users } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const { data: profiles } = await adminClient.from("profiles").select("plan, games_won");
        const { data: transactions } = await adminClient.from("manna_transactions").select("amount, type");

        const totalUsers = users?.users?.length || 0;
        const today = new Date().toISOString().split("T")[0];
        const activeToday = (users?.users || []).filter(
          (u: any) => u.last_sign_in_at && u.last_sign_in_at.startsWith(today)
        ).length;
        const freeUsers = (profiles || []).filter((p: any) => p.plan === "free").length;
        const paidUsers = (profiles || []).filter((p: any) => p.plan === "paid").length;
        const totalGames = (profiles || []).reduce((sum: number, p: any) => sum + (p.games_won || 0), 0);

        const mannaEarned = (transactions || []).filter((t: any) => t.type === "earned").reduce((s: number, t: any) => s + t.amount, 0);
        const mannaPurchased = (transactions || []).filter((t: any) => t.type === "purchased").reduce((s: number, t: any) => s + t.amount, 0);
        const mannaSpent = (transactions || []).filter((t: any) => t.type === "spent").reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
        const totalManna = (transactions || []).reduce((s: number, t: any) => s + t.amount, 0);

        result = { totalUsers, activeToday, freeUsers, paidUsers, totalGames, totalManna, mannaEarned, mannaPurchased, mannaSpent };
        break;
      }

      case "list_tournaments": {
        const { data: tournaments } = await adminClient.from("tournaments").select("*").order("created_at", { ascending: false });
        const { data: participants } = await adminClient.from("tournament_participants").select("*");

        const participantMap: Record<string, any[]> = {};
        (participants || []).forEach((p: any) => {
          if (!participantMap[p.tournament_id]) participantMap[p.tournament_id] = [];
          participantMap[p.tournament_id].push(p);
        });

        result = (tournaments || []).map((t: any) => ({
          ...t,
          participants: participantMap[t.id] || [],
          participant_count: (participantMap[t.id] || []).length,
        }));
        break;
      }

      case "end_tournament": {
        const { tournament_id } = params as { tournament_id: string };
        const { error } = await adminClient
          .from("tournaments")
          .update({ status: "ended" })
          .eq("id", tournament_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "reset_leaderboard": {
        const { tournament_id } = params as { tournament_id: string };
        const { error } = await adminClient
          .from("tournament_participants")
          .update({ score: 0 })
          .eq("tournament_id", tournament_id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
