import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Gamepad2, Flame, Sparkles, LogOut, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: BookOpen, label: "Full Bible access (all versions)" },
  { icon: Brain, label: "AI spiritual guidance" },
  { icon: Gamepad2, label: "Multiplayer games & tournaments" },
  { icon: Flame, label: "Daily streaks & manna rewards" },
  { icon: Sparkles, label: "Unlimited gameplay" },
];

const PAYSTACK_PUBLIC_KEY = "pk_test_3877141eb22c6b87bba6655a70870b8d3ddbd3a1";

const Paywall = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleBuyNow = () => {
    if (!scriptLoaded || !window.PaystackPop) {
      toast({ title: "Loading", description: "Payment system is loading, please try again." });
      return;
    }
    if (!user?.email) {
      toast({ title: "Error", description: "No email found. Please log in again.", variant: "destructive" });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: 299900,
      currency: "NGN",
      callback: async (response: { reference: string }) => {
        setLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("verify-payment", {
            body: { reference: response.reference },
          });

          if (error || !data?.success) {
            throw new Error(data?.error || "Verification failed");
          }

          toast({ title: "🎉 Welcome to Pro!", description: "You now have full access to all features." });
        } catch (err: any) {
          toast({ title: "Verification Failed", description: err.message || "Please contact support.", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      },
      onClose: () => {
        setLoading(false);
      },
    });
    handler.openIframe();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.1), hsl(var(--background)))",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-xl bg-background/70" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-6"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center"
          >
            <Crown size={36} className="text-primary" />
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-foreground mb-2">
            Unlock Full Experience
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Upgrade to Pro to access all app features
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/80 border border-border/50"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <f.icon size={18} className="text-primary" />
              </div>
              <span className="font-body text-sm text-foreground">{f.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-4">
          <span className="font-display text-2xl text-foreground">₦2,999</span>
          <span className="font-body text-sm text-muted-foreground ml-2">one-time</span>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleBuyNow}
            disabled={loading}
            className="w-full h-12 rounded-xl font-display text-base bg-primary hover:bg-primary/90 gap-2 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Crown size={18} />
            )}
            {loading ? "Processing..." : "Buy Now — Upgrade to Pro"}
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full h-11 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Paywall;
