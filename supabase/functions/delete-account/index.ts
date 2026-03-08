import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    // Verify the calling user
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) throw new Error("Unauthorized");

    const userId = user.id;

    // Use service role to delete all data and the auth user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete in dependency order to avoid FK violations
    // 1. prayer_reactions (references prayer_requests)
    await supabaseAdmin.from("prayer_reactions").delete().eq("user_id", userId);

    // 2. prayer_requests (references prayer_circles, circle_members)
    await supabaseAdmin.from("prayer_requests").delete().eq("user_id", userId);

    // 3. circle_members
    await supabaseAdmin.from("circle_members").delete().eq("user_id", userId);

    // 4. prayer_circles created by user — first clean up members & requests in those circles
    const { data: ownedCircles } = await supabaseAdmin
      .from("prayer_circles")
      .select("id")
      .eq("created_by", userId);

    if (ownedCircles && ownedCircles.length > 0) {
      const circleIds = ownedCircles.map((c) => c.id);
      // Delete reactions on requests in owned circles
      const { data: circleRequests } = await supabaseAdmin
        .from("prayer_requests")
        .select("id")
        .in("circle_id", circleIds);
      if (circleRequests && circleRequests.length > 0) {
        await supabaseAdmin
          .from("prayer_reactions")
          .delete()
          .in("request_id", circleRequests.map((r) => r.id));
      }
      await supabaseAdmin.from("prayer_requests").delete().in("circle_id", circleIds);
      await supabaseAdmin.from("circle_members").delete().in("circle_id", circleIds);
      await supabaseAdmin.from("prayer_circles").delete().in("id", circleIds);
    }

    // 5. Other user data
    await supabaseAdmin.from("chat_messages").delete().eq("user_id", userId);
    await supabaseAdmin.from("favorites").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_progress").delete().eq("user_id", userId);
    await supabaseAdmin.from("recent_activity").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 6. Storage — delete avatar folder
    const { data: avatarFiles } = await supabaseAdmin.storage
      .from("avatars")
      .list(userId);
    if (avatarFiles && avatarFiles.length > 0) {
      await supabaseAdmin.storage
        .from("avatars")
        .remove(avatarFiles.map((f) => `${userId}/${f.name}`));
    }

    // 7. Delete auth user
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteErr) throw deleteErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
