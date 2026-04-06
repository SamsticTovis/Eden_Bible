import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useStreak } from "@/hooks/useStreak";
import { useActivityLogger } from "@/hooks/useActivityLogger";

type Msg = { role: "user" | "assistant"; content: string };
type EdenMood = "happy" | "serious" | "comforting" | "celebratory";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-comfort`;

const quickPrompts = [
  "I feel anxious today",
  "I need encouragement",
  "Pray with me",
  "I'm going through a hard time",
];

// Simple tone detection
function detectMood(text: string): EdenMood {
  const lower = text.toLowerCase();
  const sadWords = ["sad", "hurt", "pain", "crying", "depressed", "anxious", "afraid", "scared", "lonely", "hard time", "struggling", "lost"];
  const happyWords = ["happy", "blessed", "grateful", "thank", "joy", "amazing", "wonderful", "great day", "excited"];
  const celebrateWords = ["streak", "achievement", "won", "completed", "unlocked", "first", "milestone"];
  if (celebrateWords.some(w => lower.includes(w))) return "celebratory";
  if (sadWords.some(w => lower.includes(w))) return "comforting";
  if (happyWords.some(w => lower.includes(w))) return "happy";
  return "serious";
}

const moodConfig: Record<EdenMood, { mouth: string; eyeScale: number; blush: number; color: string }> = {
  happy: { mouth: "M19 28 C21 32, 27 32, 29 28", eyeScale: 1, blush: 0.4, color: "hsl(var(--primary))" },
  serious: { mouth: "M20 29 L28 29", eyeScale: 1.1, blush: 0.15, color: "hsl(var(--primary))" },
  comforting: { mouth: "M20 29 C22 31, 26 31, 28 29", eyeScale: 0.9, blush: 0.3, color: "hsl(var(--accent))" },
  celebratory: { mouth: "M18 27 C21 33, 27 33, 30 27", eyeScale: 1.2, blush: 0.5, color: "hsl(var(--primary))" },
};

const EdenAvatar = ({ mood, isTyping }: { mood: EdenMood; isTyping: boolean }) => {
  const cfg = moodConfig[mood];
  return (
    <motion.div
      animate={isTyping ? { rotate: [0, -3, 3, -2, 0] } : {}}
      transition={{ duration: 1.5, repeat: isTyping ? Infinity : 0 }}
      className="flex-shrink-0"
    >
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill={cfg.color} />
        <circle cx="24" cy="24" r="20" fill="url(#avatarGrad)" />
        <circle cx="14" cy="27" r="3" fill="hsl(var(--accent))" opacity={cfg.blush} />
        <circle cx="34" cy="27" r="3" fill="hsl(var(--accent))" opacity={cfg.blush} />
        <motion.g animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.5 }} style={{ transformOrigin: "24px 22px" }}>
          <motion.ellipse cx="18" cy="22" rx="2.5" ry={2.5 * cfg.eyeScale} fill="hsl(var(--primary-foreground))" />
          <circle cx="19" cy="21.5" r="0.8" fill="hsl(var(--primary))" />
          <motion.ellipse cx="30" cy="22" rx="2.5" ry={2.5 * cfg.eyeScale} fill="hsl(var(--primary-foreground))" />
          <circle cx="31" cy="21.5" r="0.8" fill="hsl(var(--primary))" />
        </motion.g>
        <motion.path d={cfg.mouth} stroke="hsl(var(--primary-foreground))" strokeWidth="1.8" strokeLinecap="round" fill="none" animate={{ d: cfg.mouth }} transition={{ duration: 0.4 }} />
        {mood === "celebratory" && (
          <motion.g animate={{ opacity: [0, 1, 0], y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity }}>
            <circle cx="12" cy="12" r="1.5" fill="hsl(var(--joy))" />
            <circle cx="36" cy="10" r="1" fill="hsl(var(--accent))" />
            <circle cx="8" cy="18" r="1" fill="hsl(var(--primary))" />
          </motion.g>
        )}
        <defs>
          <radialGradient id="avatarGrad" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="hsl(var(--warm-glow))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

const AIComfortChat = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const { recordActivity } = useStreak();
  const { logActivity } = useActivityLogger();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Peace be with you 🕊️ I'm Eden, your spiritual companion. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMood = useMemo<EdenMood>(() => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    return lastUserMsg ? detectMood(lastUserMsg.content) : "happy";
  }, [messages]);

  useEffect(() => {
    if (!user) { setHistoryLoaded(true); return; }
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data && data.length > 0) setMessages(data as Msg[]);
      setHistoryLoaded(true);
    };
    load();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const saveMessage = async (msg: Msg) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role: msg.role, content: msg.content });
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    recordActivity();
    logActivity("chat", "Chatted with Eden AI", "MessageCircle");
    await saveMessage(userMsg);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMessages }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        toast({ title: err.error || "Failed to get response", variant: "destructive" });
        setIsLoading(false);
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
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > allMessages.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
      if (assistantSoFar) await saveMessage({ role: "assistant", content: assistantSoFar });
    } catch (e) {
      console.error(e);
      toast({ title: "Connection error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!historyLoaded) {
    return (
      <div className="max-w-md mx-auto flex items-center justify-center h-40">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="max-w-md mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* Header with avatar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <EdenAvatar mood={currentMood} isTyping={isLoading} />
          <div>
            <h2 className="font-display text-lg text-foreground">Eden AI</h2>
            <p className="font-body text-[10px] text-muted-foreground capitalize">
              {isLoading ? "typing..." : `Feeling ${currentMood}`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
          <X size={18} />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && <EdenAvatar mood={currentMood} isTyping={false} />}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md shadow-[0_2px_12px_-4px_hsl(var(--primary)/0.3)]"
                  : "bg-card/80 backdrop-blur-sm border border-border text-foreground rounded-bl-md shadow-soft"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
            <EdenAvatar mood={currentMood} isTyping={true} />
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
              <div className="flex gap-1.5">
                <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-primary/40" />
                <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 rounded-full bg-primary/40" />
                <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary/40" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((p) => (
            <button key={p} onClick={() => send(p)} className="px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border font-body text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all">
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Share what's on your heart..."
          className="flex-1 bg-card/80 backdrop-blur-sm border-border font-body text-sm rounded-xl"
          disabled={isLoading}
        />
        <Button onClick={() => send(input)} disabled={!input.trim() || isLoading} size="icon" className="rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-[0_2px_10px_-2px_hsl(var(--primary)/0.4)]">
          <Send size={16} />
        </Button>
      </div>
    </motion.div>
  );
};

export default AIComfortChat;
