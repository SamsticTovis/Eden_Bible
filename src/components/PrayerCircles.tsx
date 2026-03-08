import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Heart, BookOpen, ArrowLeft, Send, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useStreak } from "@/hooks/useStreak";
import { useActivityLogger } from "@/hooks/useActivityLogger";

interface Circle {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  max_members: number;
  created_at: string;
  invite_code: string | null;
}

interface PrayerRequest {
  id: string;
  content: string;
  verse_reference: string | null;
  user_id: string;
  created_at: string;
  reactions_count?: number;
  user_reacted?: boolean;
}

const PrayerCircles = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const { recordActivity } = useStreak();
  const { logActivity } = useActivityLogger();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newRequest, setNewRequest] = useState("");
  const [newVerse, setNewVerse] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => { loadCircles(); }, []);

  const loadCircles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("circle_members")
      .select("circle_id")
      .eq("user_id", user!.id);
    
    if (data && data.length > 0) {
      const ids = data.map(d => d.circle_id);
      const { data: circlesData } = await supabase
        .from("prayer_circles")
        .select("*")
        .in("id", ids);
      setCircles((circlesData as Circle[]) || []);
    } else {
      setCircles([]);
    }
    setLoading(false);
  };

  const createCircle = async () => {
    if (!newName.trim()) return;
    const { data, error } = await supabase
      .from("prayer_circles")
      .insert({ name: newName.trim(), description: newDesc.trim() || null, created_by: user!.id })
      .select()
      .single();
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    await supabase.from("circle_members").insert({ circle_id: data.id, user_id: user!.id });
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
    loadCircles();
    toast({ title: `"${data.name}" created 🙏` });
  };

  const joinCircle = async () => {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    // Try invite code first, then raw ID
    const { data: circle } = await supabase
      .from("prayer_circles")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();

    const circleId = circle?.id || joinCode.trim();
    const { error } = await supabase.from("circle_members").insert({ circle_id: circleId, user_id: user!.id });
    if (error) { toast({ title: "Could not join circle. Check the code and try again.", variant: "destructive" }); return; }
    setJoinCode("");
    loadCircles();
    toast({ title: "Joined circle! 🎉" });
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Invite code copied! 📋" });
  };

  const openCircle = async (circle: Circle) => {
    setSelectedCircle(circle);
    const { data } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("circle_id", circle.id)
      .order("created_at", { ascending: false });
    
    const reqs = (data || []) as PrayerRequest[];
    // Load reaction counts in batch
    for (const req of reqs) {
      const { count } = await supabase
        .from("prayer_reactions")
        .select("*", { count: "exact", head: true })
        .eq("request_id", req.id);
      req.reactions_count = count || 0;
      const { data: myReaction } = await supabase
        .from("prayer_reactions")
        .select("id")
        .eq("request_id", req.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      req.user_reacted = !!myReaction;
    }
    setRequests(reqs);
  };

  const submitRequest = async () => {
    if (!newRequest.trim() || !selectedCircle) return;
    const { error } = await supabase.from("prayer_requests").insert({
      circle_id: selectedCircle.id,
      user_id: user!.id,
      content: newRequest.trim(),
      verse_reference: newVerse.trim() || null,
    });
    if (error) { toast({ title: error.message, variant: "destructive" }); return; }
    setNewRequest("");
    setNewVerse("");
    openCircle(selectedCircle);
    recordActivity();
  };

  const toggleAmen = async (req: PrayerRequest) => {
    if (req.user_reacted) {
      await supabase.from("prayer_reactions").delete().eq("request_id", req.id).eq("user_id", user!.id);
    } else {
      await supabase.from("prayer_reactions").insert({ request_id: req.id, user_id: user!.id });
    }
    openCircle(selectedCircle!);
  };

  if (selectedCircle) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
        <button onClick={() => setSelectedCircle(null)} className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline">
          <ArrowLeft size={16} /> Back to circles
        </button>
        <h2 className="font-display text-xl text-foreground mb-1">{selectedCircle.name}</h2>
        {selectedCircle.description && (
          <p className="font-body text-sm text-muted-foreground mb-3">{selectedCircle.description}</p>
        )}
        {selectedCircle.invite_code && (
          <button
            onClick={() => copyInviteCode(selectedCircle.invite_code!)}
            className="flex items-center gap-2 font-body text-xs text-muted-foreground mb-4 bg-muted px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Copy size={12} />
            Invite code: <span className="text-primary font-semibold">{selectedCircle.invite_code}</span>
          </button>
        )}

        {/* New request */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-2">
          <Textarea
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Share a prayer request or encouragement..."
            className="bg-background border-border font-body text-sm rounded-xl resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <Input
              value={newVerse}
              onChange={(e) => setNewVerse(e.target.value)}
              placeholder="Verse reference (optional)"
              className="bg-background border-border font-body text-sm rounded-xl flex-1"
            />
            <Button onClick={submitRequest} size="icon" className="rounded-xl bg-primary"><Send size={16} /></Button>
          </div>
        </div>

        {/* Requests */}
        <div className="space-y-3">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <p className="font-body text-sm text-foreground mb-2 leading-relaxed">{req.content}</p>
              {req.verse_reference && (
                <p className="font-body text-xs text-primary flex items-center gap-1 mb-2">
                  <BookOpen size={12} /> {req.verse_reference}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => toggleAmen(req)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                    req.user_reacted
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  <Heart size={12} fill={req.user_reacted ? "currentColor" : "none"} />
                  Amen {req.reactions_count ? `(${req.reactions_count})` : ""}
                </button>
              </div>
            </motion.div>
          ))}
          {requests.length === 0 && (
            <p className="text-center font-body text-sm text-muted-foreground py-8">
              No prayer requests yet. Be the first to share 🙏
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-primary font-body text-sm mb-4 hover:underline">
        <ArrowLeft size={16} /> Back
      </button>
      <h2 className="font-display text-2xl text-foreground mb-1">Prayer Circles</h2>
      <p className="font-body text-sm text-muted-foreground mb-6">Small groups united in prayer 🙏</p>

      {/* Join */}
      <div className="flex gap-2 mb-4">
        <Input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter invite code to join..."
          className="flex-1 bg-card border-border font-body text-sm rounded-xl"
        />
        <Button onClick={joinCircle} variant="outline" className="rounded-xl font-body text-sm">Join</Button>
      </div>

      {/* Create */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Circle name" className="bg-background border-border font-body text-sm rounded-xl" />
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="bg-background border-border font-body text-sm rounded-xl resize-none" rows={2} />
              <div className="flex gap-2">
                <Button onClick={createCircle} className="rounded-xl font-body text-sm bg-primary flex-1">Create</Button>
                <Button onClick={() => setShowCreate(false)} variant="ghost" className="rounded-xl font-body text-sm">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showCreate && (
        <Button onClick={() => setShowCreate(true)} variant="outline" className="w-full rounded-xl font-body text-sm gap-2 mb-6 border-dashed border-border">
          <Plus size={16} /> Create a Prayer Circle
        </Button>
      )}

      {/* Circles list */}
      <div className="space-y-2.5">
        {circles.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => openCircle(c)}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/20 hover:shadow-soft transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body text-sm font-medium text-foreground">{c.name}</h3>
                {c.description && <p className="font-body text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
              </div>
            </div>
          </motion.button>
        ))}
        {!loading && circles.length === 0 && (
          <p className="text-center font-body text-sm text-muted-foreground py-8">
            Create or join a prayer circle to get started 💛
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PrayerCircles;
