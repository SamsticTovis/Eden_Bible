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

// Detect if input looks like a Bible reference (e.g. "Genesis 1", "Psalm 23", "John 3:16")
const isReference = (q: string) => /^[1-3]?\s?[a-zA-Z]+\s+\d+/i.test(q.trim());

// Parse reference into book + chapter
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

    // If it's a reference, don't search DB — trigger chapter load
    if (isReference(query)) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timeout = setTimeout(() => searchVerses(query.trim()), 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReference(query)) {
      const parsed = parseReference(query);
      if (parsed) {
        onLoadChapter(parsed.book, parsed.chapter);
        setQuery("");
      }
    }
  };

  const searchVerses = async (term: string) => {
    setLoading(true);
    setSearched(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (verse: Verse) => {
    const saved = JSON.parse(localStorage.getItem("eden-saved") || "[]");
    const exists = saved.some((v: Verse) => v.id === verse.id);
    if (exists) {
      localStorage.setItem("eden-saved", JSON.stringify(saved.filter((v: Verse) => v.id !== verse.id)));
      toast({ title: "Removed ❌", description: verse.reference });
    } else {
      saved.push(verse);
      localStorage.setItem("eden-saved", JSON.stringify(saved));
      toast({ title: "Saved! ❤️", description: verse.reference });
    }
  };

  const isSaved = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("eden-saved") || "[]");
    return saved.some((v: Verse) => v.id === id);
  };

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'Genesis 1', 'peace', or 'strength'..."
          className="pl-10 pr-10 bg-card border-2 border-border font-body rounded-xl h-12 text-base shadow-bold focus:border-primary"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Reference hint */}
      {isReference(query) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary font-body font-semibold mb-3 px-1">
          Press Enter to load {query} →
        </motion.p>
      )}

      {/* Quick tags */}
      {!searched && !isReference(query) && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground font-body font-semibold mb-2 uppercase tracking-wider">Quick topics</p>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-body font-bold border-2 border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-6">
          <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-body font-semibold">{results.length} verse{results.length !== 1 ? "s" : ""} found</p>
            {results.map((verse, i) => (
              <motion.div
                key={verse.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border-2 border-border rounded-2xl p-4 shadow-bold cursor-pointer hover:border-primary/40 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-display font-bold text-sm text-primary">{verse.reference}</span>
                  <button onClick={() => handleSave(verse)} className="p-1">
                    <Heart size={16} className={isSaved(verse.id) ? "text-destructive fill-destructive" : "text-muted-foreground"} />
                  </button>
                </div>
                <p className="font-body text-foreground leading-relaxed text-sm line-clamp-3 mb-2">"{verse.text}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-body font-semibold bg-muted px-2 py-0.5 rounded-full border border-border">
                    {verse.version}
                  </span>
                  {verse.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] text-primary/70 font-body font-semibold">#{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {searched && !loading && results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <p className="text-3xl mb-2">📖</p>
          <p className="text-muted-foreground font-body text-sm font-medium">No verses found. Try another keyword!</p>
        </motion.div>
      )}
    </div>
  );
};

export default SmartSearch;
