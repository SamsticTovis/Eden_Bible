import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  /** Call before any community feature — returns false + shows toast for guests */
  requireAuth: (featureName?: string) => boolean;
}

const GUEST_KEY = "eden-guest-session";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isGuest: false,
  signOut: async () => {},
  continueAsGuest: () => {},
  requireAuth: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem(GUEST_KEY);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user && localStorage.getItem(GUEST_KEY) === "true") {
        setIsGuest(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setIsGuest(false);
    setUser(null);
    setSession(null);
    localStorage.removeItem(GUEST_KEY);
    await supabase.auth.signOut();
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
  };

  const requireAuth = useCallback((featureName?: string): boolean => {
    if (isGuest || !user) {
      toast({
        title: "Account required",
        description: featureName
          ? `Create an account to ${featureName}.`
          : "Create an account to unlock this feature.",
      });
      return false;
    }
    return true;
  }, [isGuest, user]);

  return (
    <AuthContext.Provider value={{ user, session, loading, isGuest, signOut, continueAsGuest, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
