import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

export const useUserPlan = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    setPlan(data?.plan || "free");
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setPlan("free");
    setLoading(true);
    fetchPlan();
  }, [fetchPlan]);

  // Listen for plan changes in real-time
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`plan-sync-${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row?.plan) setPlan(row.plan);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const isPro = plan === "pro" || plan === "paid";
  const hasAccess = isPro || isAdmin;

  return { plan, isPro, isAdmin, hasAccess, loading, refresh: fetchPlan };
};
