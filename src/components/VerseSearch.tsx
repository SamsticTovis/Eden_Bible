import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, BookOpen, X } from "lucide-react";
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

const popularTags = ["peace", "strength", "love", "healing", "faith", "joy", "comfort", "money"];

const VerseSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const timeout = setTimeout(() => searchVerses(query.trim()), 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const searchVerses = async (term: string) => {
    setLoading(true);
    setSearched(true);
    try {
      // Search by text, reference, tags, and mood
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

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  const handleSave = (verse: Verse) => {
    // For now save to localStorage since auth isn't set up yet
    const saved = JSON.parse(localStorage.getItem("soulshine-saved") || "[]");
    const exists = saved.some((v: Verse) => v.id === verse.id);
    if (exists) {
      localStorage.setItem("soulshine-saved", JSON.stringify(saved.filter((v: Verse) => v.id !== verse.id)));
      toast({ title: "Removed from favorites", description: verse.reference });
    } else {
      saved.push(verse);
      localStorage.setItem("soulshine-saved", JSON.stringify(saved));
      toast({ title: "Saved to favorites! ❤️", description: verse.reference });
    }
  };

  const isSaved = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("soulshine-saved") || "[]");
    return saved.some((v: Verse) => v.id === id);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-2xl text-center mb-2 text-foreground">Bible Search</h2>
      <p className="text-center text-muted-foreground font-body mb-6 text-sm">
        Find the perfect verse for any moment 🔍
      </p>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search peace, strength, love..."
          className="pl-10 pr-10 bg-card border-border font-body"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Popular Tags */}
      {!searched && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-body mb-2">Popular topics</p>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-body font-medium hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground font-body">{results.length} verse{results.length !== 1 ? "s" : ""} found</p>
            {results.map((verse, i) => (
              <motion.div
                key={verse.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    <span className="font-display text-sm text-primary">{verse.reference}</span>
                  </div>
                  <button onClick={() => handleSave(verse)} className="p-1">
                    <Heart
                      size={18}
                      className={isSaved(verse.id) ? "text-accent fill-accent" : "text-muted-foreground"}
                    />
                  </button>
                </div>
                <p className="font-body text-foreground text-sm leading-relaxed mb-2">"{verse.text}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-body bg-muted px-2 py-0.5 rounded-full">
                    {verse.version}
                  </span>
                  {verse.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] text-primary/70 font-body">#{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <p className="text-4xl mb-2">📖</p>
          <p className="text-muted-foreground font-body text-sm">No verses found. Try a different keyword!</p>
        </motion.div>
      )}
    </div>
  );
};

export default VerseSearch;
