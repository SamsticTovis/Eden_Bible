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

  useEffect(() => { loadVerse(); }, []);

  const loadVerse = async () => {
    const today = new Date().toISOString().split("T")[0];
    const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);
    const { data } = await supabase.from("verses").select("*");
    if (data && data.length > 0) setVerse(data[seed % data.length]);
  };

  if (!verse) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
          <Sparkles size={14} className="text-secondary" />
        </div>
        <div>
          <p className="font-display font-semibold text-sm text-foreground">Verse of the Day</p>
          <p className="text-[9px] text-muted-foreground font-medium">Eden's pick for you ✨</p>
        </div>
        <button onClick={loadVerse} className="ml-auto p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          <RefreshCw size={13} className="text-muted-foreground" />
        </button>
      </div>
      <p className="font-body text-foreground/85 leading-relaxed mb-2 text-[14px]">"{verse.text}"</p>
      <div className="flex items-center gap-2">
        <span className="font-display font-semibold text-sm text-primary">{verse.reference}</span>
        <span className="text-[9px] text-muted-foreground font-medium bg-muted/30 px-1.5 py-0.5 rounded-full">{verse.version}</span>
      </div>
    </motion.div>
  );
};

export default VerseOfTheDay;
