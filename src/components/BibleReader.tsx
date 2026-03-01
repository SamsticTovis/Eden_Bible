import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Minus, Plus, BookOpen, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

const popularTags = ["peace", "strength", "love", "healing", "faith", "joy", "comfort", "money", "hope"];

const BibleReader = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const timeout = setTimeout(() => searchVerses(query.trim()), 400);
    return () => clearTimeout(timeout);
  }, [query]);

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
      toast({ title: "Removed from favorites", description: verse.reference });
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
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-2xl text-center mb-1 text-foreground">Bible Reader</h2>
      <p className="text-center text-muted-foreground font-body mb-5 text-sm">
        Search, read & save your favorite verses 📖
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search peace, love, Psalm 23..."
          className="pl-10 pr-10 bg-card border-border font-body"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Font size control */}
      <div className="flex items-center gap-3 mb-4 bg-card border border-border rounded-xl px-3 py-2">
        <Minus size={14} className="text-muted-foreground" />
        <Slider
          value={[fontSize]}
          onValueChange={([v]) => setFontSize(v)}
          min={12}
          max={24}
          step={1}
          className="flex-1"
        />
        <Plus size={14} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-body w-8">{fontSize}px</span>
      </div>

      {/* Quick tags */}
      {!searched && (
        <div className="mb-5">
          <p className="text-xs text-muted-foreground font-body mb-2">Popular topics</p>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-body font-medium hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {/* Reader mode for selected verse */}
      <AnimatePresence>
        {selectedVerse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedVerse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-warm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  <span className="font-display text-primary">{selectedVerse.reference}</span>
                </div>
                <button onClick={() => setSelectedVerse(null)}>
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <p
                className="font-body text-foreground leading-relaxed mb-4"
                style={{ fontSize: `${fontSize}px` }}
              >
                "{selectedVerse.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body bg-muted px-2 py-0.5 rounded-full">
                  {selectedVerse.version}
                </span>
                <Button
                  size="sm"
                  variant={isSaved(selectedVerse.id) ? "default" : "outline"}
                  onClick={() => handleSave(selectedVerse)}
                  className="gap-1 font-body"
                >
                  <Heart size={14} className={isSaved(selectedVerse.id) ? "fill-current" : ""} />
                  {isSaved(selectedVerse.id) ? "Saved" : "Save"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedVerse(verse)}
                className="bg-card border border-border rounded-xl p-4 shadow-soft cursor-pointer hover:border-primary/30 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    <span className="font-display text-sm text-primary">{verse.reference}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(verse); }}
                    className="p-1"
                  >
                    <Heart size={16} className={isSaved(verse.id) ? "text-accent fill-accent" : "text-muted-foreground"} />
                  </button>
                </div>
                <p
                  className="font-body text-foreground leading-relaxed mb-2 line-clamp-3"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  "{verse.text}"
                </p>
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

      {searched && !loading && results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <p className="text-4xl mb-2">📖</p>
          <p className="text-muted-foreground font-body text-sm">No verses found. Try a different keyword!</p>
        </motion.div>
      )}
    </div>
  );
};

export default BibleReader;
