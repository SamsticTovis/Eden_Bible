import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Verse {
  id: string;
  reference: string;
  text: string;
  version: string;
  tags: string[];
  mood: string | null;
  book: string | null;
}

const isReference = (q: string) => /^[1-3]?\s?[a-zA-Z]+\s+\d+/i.test(q.trim());

const parseReference = (q: string): { book: string; chapter: number } | null => {
  const match = q.trim().match(/^([1-3]?\s?[a-zA-Z]+)\s+(\d+)/i);
  if (!match) return null;
  return { book: match[1].trim(), chapter: parseInt(match[2]) };
};

const popularTags = ["peace", "strength", "love", "healing", "faith", "joy", "comfort", "money", "hope", "anxious"];

interface SmartSearchProps {
  onLoadChapter: (book: string, chapter: number) => void;
  translation: string;
}

const SmartSearch = ({ onLoadChapter, translation }: SmartSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    if (isReference(query)) { setResults([]); setSearched(false); return; }
    const timeout = setTimeout(() => searchVerses(query.trim()), 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReference(query)) {
      const parsed = parseReference(query);
      if (parsed) { onLoadChapter(parsed.book, parsed.chapter); setQuery(""); }
    }
  };

  const searchVerses = async (term: string) => {
    setLoading(true); setSearched(true);
    try {
      const lower = term.toLowerCase();
      const { data, error } = await supabase
        .from("verses")
        .select("*")
        .or(`text.ilike.%${lower}%,reference.ilike.%${lower}%,mood.ilike.%${lower}%,tags.cs.{${lower}}`);
      if (error) throw error;
      setResults(data || []);
    } catch {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSave = (verse: Verse) => {
    const saved = JSON.parse(localStorage.getItem("eden-saved") || "[]");
    const exists = saved.some((v: Verse) => v.id === verse.id);
    if (exists) {
      localStorage.setItem("eden-saved", JSON.stringify(saved.filter((v: Verse) => v.id !== verse.id)));
      toast({ title: "Removed", description: verse.reference });
    } else {
      saved.push(verse);
      localStorage.setItem("eden-saved", JSON.stringify(saved));
      toast({ title: "Saved ❤️", description: verse.reference });
    }
  };

  const isSaved = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("eden-saved") || "[]");
    return saved.some((v: Verse) => v.id === id);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'Genesis 1', 'peace', or 'strength'..."
          className="pl-10 pr-10 glass border-0 font-body rounded-xl h-11 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={14} />
          </button>
        )}
      </form>

      {isReference(query) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary font-medium mb-3 px-1">
          Press Enter to load {query} →
        </motion.p>
      )}

      {!searched && !isReference(query) && (
        <div className="mb-4">
          <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-widest">Quick topics</p>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-2.5 py-1 rounded-full glass text-primary text-[11px] font-medium hover:bg-primary/10 transition-all active:scale-95"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-6">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
            <p className="text-[10px] text-muted-foreground font-medium">{results.length} verse{results.length !== 1 ? "s" : ""} found</p>
            {results.map((verse, i) => (
              <motion.div
                key={verse.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-display font-semibold text-sm text-primary">{verse.reference}</span>
                  <button onClick={() => handleSave(verse)} className="p-1">
                    <Heart size={14} className={isSaved(verse.id) ? "text-destructive fill-destructive" : "text-muted-foreground"} />
                  </button>
                </div>
                <p className="font-body text-foreground/80 leading-relaxed text-sm line-clamp-3 mb-2">"{verse.text}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded-full">
                    {verse.version}
                  </span>
                  {verse.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[9px] text-primary/60 font-medium">#{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {searched && !loading && results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-muted-foreground font-body text-sm">No verses found. Try another keyword!</p>
        </motion.div>
      )}
    </div>
  );
};

export default SmartSearch;
