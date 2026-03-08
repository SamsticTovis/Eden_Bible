import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ActivityIcon = "BookOpen" | "Gamepad2" | "Users" | "MessageCircle" | "Heart";

export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = useCallback(
    async (type: string, description: string, icon: ActivityIcon = "BookOpen") => {
      if (!user) return;
      await supabase.from("recent_activity").insert({
        user_id: user.id,
        activity_type: type,
        description,
        icon,
      });
    },
    [user]
  );

  return { logActivity };
};
