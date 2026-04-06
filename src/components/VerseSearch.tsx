import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, BookOpen, X, Sparkles, Tag } from "lucide-react";
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
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setAiSuggestion(null);
      return;
    }
    const timeout = setTimeout(() => searchVerses(query.trim()), 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const searchVerses = async (term: string) => {
    setLoading(true);
    setSearched(true);
    setAiSuggestion(null);
    try {
      const lower = term.toLowerCase();
      const { data, error } = await supabase
        .from("verses")
        .select("*")
        .or(`text.ilike.%${lower}%,reference.ilike.%${lower}%,mood.ilike.%${lower}%,tags.cs.{${lower}}`);

      if (error) throw error;
      setResults(data || []);

      // If no results, fetch AI suggestion
      if (!data || data.length === 0) {
        fetchAISuggestion(term);
      }
    } catch {
      toast({ title: "Search failed", description: "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestion = async (term: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-comfort", {
        body: { messages: [{ role: "user", content: `Give me 3 Bible verses about "${term}" with their references. Format: Reference - "verse text". Keep it brief.` }] },
      });
      if (error) return;
      // For non-streaming fallback
      if (typeof data === "string") {
        setAiSuggestion(data);
      }
    } catch {
      // Silently fail - AI suggestions are optional
    }
  };

  const handleTagClick = (tag: string) => setQuery(tag);

  const handleSave = (verse: Verse) => {
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

  // Highlight matching keywords
  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark> : part
    );
  };

  // Group results by book
  const groupedResults = results.reduce<Record<string, Verse[]>>((acc, verse) => {
    const book = verse.book || "Other";
    if (!acc[book]) acc[book] = [];
    acc[book].push(verse);
    return acc;
  }, {});

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-2xl text-center mb-2 text-foreground">Bible Search</h2>
      <p className="text-center text-muted-foreground font-body mb-6 text-sm">
        Find the perfect verse for any moment
      </p>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by book, topic, or keyword..."
          className="pl-10 pr-10 bg-card/80 backdrop-blur-sm border-border font-body rounded-xl"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Popular Tags */}
      {!searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag size={12} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-body">Popular topics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <motion.button
                key={tag}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-body font-medium hover:bg-primary/15 transition-all"
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {/* Results grouped by book */}
      <AnimatePresence>
        {Object.keys(groupedResults).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground font-body">{results.length} verse{results.length !== 1 ? "s" : ""} found</p>
            {Object.entries(groupedResults).map(([book, verses]) => (
              <div key={book}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={12} className="text-primary" />
                  <span className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider">{book}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {verses.map((verse, i) => (
                    <motion.div
                      key={verse.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-display text-sm text-primary">{verse.reference}</span>
                        <button onClick={() => handleSave(verse)} className="p-1 hover:scale-110 transition-transform">
                          <Heart size={16} className={isSaved(verse.id) ? "text-accent fill-accent" : "text-muted-foreground"} />
                        </button>
                      </div>
                      <p className="font-body text-foreground text-sm leading-relaxed mb-2">
                        "{highlightText(verse.text, query)}"
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground font-body bg-muted px-2 py-0.5 rounded-full">{verse.version}</span>
                        {verse.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] text-primary/70 font-body cursor-pointer hover:text-primary" onClick={() => setQuery(tag)}>#{tag}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Suggestion fallback */}
      {searched && !loading && results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-muted-foreground font-body text-sm mb-4">No verses found in the database.</p>
          {aiSuggestion ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <span className="font-body text-[11px] text-primary font-semibold uppercase tracking-wider">AI Suggestions</span>
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{aiSuggestion}</p>
            </motion.div>
          ) : (
            <p className="text-muted-foreground/60 font-body text-xs">Try a different keyword!</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VerseSearch;
