import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

interface Verse {
  id: string;
  reference: string;
  text: string;
  version: string;
  tags: string[];
}

const VerseOfTheDay = () => {
  const [verse, setVerse] = useState<Verse | null>(null);

  useEffect(() => {
    loadVerse();
  }, []);

  const loadVerse = async () => {
    // Use today's date as a seed for consistent daily verse
    const today = new Date().toISOString().split("T")[0];
    const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);

    const { data } = await supabase.from("verses").select("*");
    if (data && data.length > 0) {
      const idx = seed % data.length;
      setVerse(data[idx]);
    }
  };

  if (!verse) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-border rounded-2xl p-5 shadow-bold"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Sparkles size={16} className="text-secondary" />
        </div>
        <div>
          <p className="font-display font-extrabold text-sm text-foreground">Verse of the Day</p>
          <p className="text-[10px] text-muted-foreground font-body font-semibold">Eden's pick for you ✨</p>
        </div>
        <button onClick={loadVerse} className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors">
          <RefreshCw size={14} className="text-muted-foreground" />
        </button>
      </div>
      <p className="font-body text-foreground leading-relaxed mb-2 text-[15px]">"{verse.text}"</p>
      <div className="flex items-center gap-2">
        <span className="font-display font-bold text-sm text-primary">{verse.reference}</span>
        <span className="text-[10px] text-muted-foreground font-body font-semibold bg-muted px-2 py-0.5 rounded-full border border-border">
          {verse.version}
        </span>
      </div>
    </motion.div>
  );
};

export default VerseOfTheDay;
