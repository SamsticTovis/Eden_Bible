import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BookmarkPlus, BookmarkCheck, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const SERMON_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sermon`;

const suggestedTopics = ["Faith", "Forgiveness", "Prayer", "Purpose", "Love", "Hope", "Grace", "Patience"];

interface SavedSermon {
  id: string;
  topic: string;
  title: string;
  content: string;
  created_at: string;
}

const SermonsPage = () => {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [sermon, setSermon] = useState("");
  const [sermonTitle, setSermonTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState<SavedSermon[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [view, setView] = useState<"input" | "result" | "saved">("input");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved sermons
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("saved_sermons")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setSaved(data as SavedSermon[]);
    };
    load();
  }, [user]);

  // Auto-scroll during generation
  useEffect(() => {
    if (isGenerating && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sermon, isGenerating]);

  const generate = async (topicText: string) => {
    if (!topicText.trim() || isGenerating) return;
    setIsGenerating(true);
    setSermon("");
    setSermonTitle("");
    setIsSaved(false);
    setView("result");

    let fullText = "";

    try {
      const resp = await fetch(SERMON_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ topic: topicText.trim() }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        toast({ title: err.error || "Failed to generate sermon", variant: "destructive" });
        setIsGenerating(false);
        setView("input");
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setSermon(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Extract title from first markdown heading
      const titleMatch = fullText.match(/^#\s+(.+)$/m);
      if (titleMatch) setSermonTitle(titleMatch[1]);
    } catch (e) {
      console.error("Sermon generation error:", e);
      toast({ title: "Failed to generate sermon", variant: "destructive" });
      setView("input");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSermon = async () => {
    if (!user || !sermon || isSaved) return;
    const title = sermonTitle || `Sermon on ${topic}`;
    const { data, error } = await supabase
      .from("saved_sermons")
      .insert({
        user_id: user.id,
        topic: topic.trim(),
        title,
        content: sermon,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Could not save sermon", variant: "destructive" });
      return;
    }
    setIsSaved(true);
    setSaved((prev) => [data as SavedSermon, ...prev]);
    toast({ title: "Sermon saved! 📖" });
  };

  const deleteSermon = async (id: string) => {
    await supabase.from("saved_sermons").delete().eq("id", id);
    setSaved((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Sermon removed" });
  };

  const openSaved = (s: SavedSermon) => {
    setSermon(s.content);
    setSermonTitle(s.title);
    setTopic(s.topic);
    setIsSaved(true);
    setView("result");
  };

  // Result view
  if (view === "result") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto"
      >
        <button
          onClick={() => { setView("input"); setSermon(""); }}
          className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div
          ref={scrollRef}
          className="bg-card border border-border rounded-2xl p-5 shadow-soft max-h-[65vh] overflow-y-auto"
        >
          {isGenerating && !sermon && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
              <span className="ml-3 font-body text-sm text-muted-foreground">Generating sermon...</span>
            </div>
          )}
          {sermon && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-display text-xl text-foreground mb-4 mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-display text-lg text-foreground mt-6 mb-2 flex items-center gap-2">
                      <Sparkles size={14} className="text-primary flex-shrink-0" />
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="font-body text-sm text-foreground/85 leading-relaxed mb-3">{children}</p>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-3 border-primary/40 pl-4 py-1 my-3 bg-primary/5 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">{children}</strong>
                  ),
                  li: ({ children }) => (
                    <li className="font-body text-sm text-foreground/85 mb-1.5">{children}</li>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                  ),
                }}
              >
                {sermon}
              </ReactMarkdown>
            </div>
          )}
          {isGenerating && sermon && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-body text-xs text-muted-foreground">Writing...</span>
            </div>
          )}
        </div>

        {!isGenerating && sermon && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-4"
          >
            <Button
              onClick={saveSermon}
              disabled={isSaved || !user}
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
              {isSaved ? "Saved" : "Save Sermon"}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setView("input"); setSermon(""); }}
              className="gap-2"
            >
              New Sermon
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Saved sermons view
  if (view === "saved") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
        <button
          onClick={() => setView("input")}
          className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h2 className="font-display text-xl text-foreground mb-4">Saved Sermons</h2>
        {saved.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-soft">
            <p className="font-body text-sm text-muted-foreground">No saved sermons yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {saved.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-soft"
              >
                <button
                  onClick={() => openSaved(s)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-display text-sm text-foreground truncate">{s.title}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                    {s.topic} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </button>
                <button
                  onClick={() => deleteSermon(s.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  // Input view
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-foreground mb-1">Sermons</h2>
        <p className="font-body text-sm text-muted-foreground">Generate Bible teachings on any topic</p>
      </div>

      {/* Topic input */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate(topic)}
            placeholder="Enter a topic..."
            className="pl-9 font-body bg-card border-border"
          />
        </div>
        <Button
          onClick={() => generate(topic)}
          disabled={!topic.trim() || isGenerating}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Sparkles size={16} />
          Generate
        </Button>
      </div>

      {/* Suggested topics */}
      <div className="mb-6">
        <p className="font-body text-xs text-muted-foreground mb-2 uppercase tracking-wider">Suggested Topics</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button
              key={t}
              onClick={() => { setTopic(t); generate(t); }}
              className="px-3 py-1.5 rounded-full bg-primary/8 text-primary font-body text-sm hover:bg-primary/15 transition-colors active:scale-95"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Saved sermons button */}
      {saved.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setView("saved")}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-soft hover:border-primary/20 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookmarkCheck size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="font-display text-sm text-foreground">Saved Sermons</p>
              <p className="font-body text-[10px] text-muted-foreground">{saved.length} sermon{saved.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-muted-foreground rotate-180" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default SermonsPage;
