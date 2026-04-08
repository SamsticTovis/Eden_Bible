import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Edit3, Flame, Sparkles, Users, Gamepad2, ArrowLeft, Check, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useManna } from "@/hooks/useManna";
import { useStreak } from "@/hooks/useStreak";

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage = ({ onBack }: ProfilePageProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<{
    username: string | null;
    avatar_url: string | null;
    chapters_read: number;
    games_won: number;
    reading_streak: number;
  } | null>(null);

  const [circles, setCircles] = useState<{ id: string; name: string }[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const { manna } = useManna();
  const { streak } = useStreak();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, circlesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("circle_members")
          .select("circle_id, prayer_circles(id, name)")
          .eq("user_id", user.id),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (circlesRes.data) {
        setCircles(
          circlesRes.data
            .map((cm: any) => cm.prayer_circles)
            .filter(Boolean)
        );
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ username: editName.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      toast({ title: "Error", description: "Could not update name." });
    } else {
      setProfile((p) => (p ? { ...p, username: editName.trim() } : p));
      toast({ title: "Saved", description: "Display name updated." });
    }
    setEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setProfile((p) => (p ? { ...p, avatar_url } : p));
    setUploading(false);
    toast({ title: "Avatar updated!" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.username || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const stats = [
    { label: "Manna", value: manna, icon: Sparkles, color: "text-primary" },
    { label: "Streak", value: streak, icon: Flame, color: "text-accent" },
    { label: "Chapters", value: profile?.chapters_read ?? 0, icon: Flame, color: "text-primary" },
    { label: "Games Won", value: profile?.games_won ?? 0, icon: Gamepad2, color: "text-accent" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
      <button
        onClick={onBack}
        className="text-primary font-body text-sm mb-4 flex items-center gap-1 hover:underline"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="font-display text-2xl text-center mb-6 text-foreground">Your Profile</h2>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-2 border-primary/30">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-lg font-display bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        {uploading && <p className="text-xs text-muted-foreground mt-2 font-body">Uploading…</p>}

        {/* Name */}
        {editing ? (
          <div className="flex items-center gap-2 mt-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9 w-48 text-center font-body"
              autoFocus
            />
            <button onClick={handleSaveName} className="text-primary hover:scale-110 transition-transform">
              <Check size={18} />
            </button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground hover:scale-110 transition-transform">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3">
            <h3 className="font-display text-lg text-foreground">{displayName}</h3>
            <button
              onClick={() => { setEditName(displayName); setEditing(true); }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit3 size={14} />
            </button>
          </div>
        )}
        <p className="text-sm text-muted-foreground font-body">{user?.email}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="font-display text-lg text-foreground">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Prayer circles */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-primary" />
          <p className="font-body font-medium text-foreground text-sm">Prayer Circles</p>
        </div>
        {circles.length === 0 ? (
          <p className="font-body text-xs text-muted-foreground">You haven't joined any circles yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {circles.map((c) => (
              <div key={c.id} className="px-3 py-2 bg-muted rounded-xl font-body text-sm text-foreground">
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePage;
