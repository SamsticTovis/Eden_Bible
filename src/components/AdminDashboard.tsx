import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Users, BarChart3, Trophy, Coins, ArrowLeft, Ban,
  Trash2, RotateCcw, CreditCard, Plus, Minus, ShieldAlert,
  Crown, Gamepad2, BookOpen, Flame,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  username: string | null;
  plan: string;
  reading_streak: number;
  games_won: number;
  chapters_read: number;
  circles_joined: number;
  is_banned: boolean;
}

interface Analytics {
  totalUsers: number;
  activeToday: number;
  freeUsers: number;
  paidUsers: number;
  totalGames: number;
  totalManna: number;
  mannaEarned: number;
  mannaPurchased: number;
  mannaSpent: number;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  entry_cost: number;
  prize_pool: number;
  participant_count: number;
  starts_at: string;
  ends_at: string;
}

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const { adminAction } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [mannaDialog, setMannaDialog] = useState<{ userId: string; username: string } | null>(null);
  const [mannaAmount, setMannaAmount] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ action: string; userId: string; username: string } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await adminAction("list_users");
      setUsers(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    }
    setLoadingUsers(false);
  }, [adminAction]);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await adminAction("get_analytics");
      setAnalytics(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    }
    setLoadingAnalytics(false);
  }, [adminAction]);

  const loadTournaments = useCallback(async () => {
    try {
      const data = await adminAction("list_tournaments");
      setTournaments(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    }
  }, [adminAction]);

  useEffect(() => {
    loadUsers();
    loadAnalytics();
    loadTournaments();
  }, []);

  const handleAction = async (action: string, params: Record<string, unknown>, successMsg: string) => {
    try {
      await adminAction(action, params);
      toast({ title: "Success", description: successMsg });
      loadUsers();
      loadAnalytics();
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    }
  };

  const executeConfirm = async () => {
    if (!confirmDialog) return;
    const { action, userId, username } = confirmDialog;
    switch (action) {
      case "ban":
        await handleAction("ban_user", { user_id: userId }, `${username} has been banned.`);
        break;
      case "unban":
        await handleAction("unban_user", { user_id: userId }, `${username} has been unbanned.`);
        break;
      case "delete":
        await handleAction("delete_user", { user_id: userId }, `${username}'s account deleted.`);
        break;
      case "reset_streak":
        await handleAction("reset_streak", { user_id: userId }, `${username}'s streak reset.`);
        break;
    }
    setConfirmDialog(null);
  };

  const handleManna = async (add: boolean) => {
    if (!mannaDialog || !mannaAmount) return;
    const amount = add ? Math.abs(parseInt(mannaAmount)) : -Math.abs(parseInt(mannaAmount));
    if (isNaN(amount)) return;
    await handleAction("add_manna", {
      user_id: mannaDialog.userId,
      amount,
      description: `Admin ${add ? "added" : "removed"} ${Math.abs(amount)} manna`,
    }, `${Math.abs(amount)} manna ${add ? "added to" : "removed from"} ${mannaDialog.username}.`);
    setMannaDialog(null);
    setMannaAmount("");
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-primary font-body text-sm flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="font-display text-xl text-foreground flex items-center gap-2">
          <ShieldAlert size={22} className="text-primary" /> Admin Dashboard
        </h2>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users" className="text-xs"><Users size={14} className="mr-1" />Users</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs"><BarChart3 size={14} className="mr-1" />Stats</TabsTrigger>
          <TabsTrigger value="tournaments" className="text-xs"><Trophy size={14} className="mr-1" />Tournaments</TabsTrigger>
          <TabsTrigger value="economy" className="text-xs"><Coins size={14} className="mr-1" />Economy</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-3 mt-3">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-body"
          />
          {loadingUsers ? (
            <div className="text-center py-8 text-muted-foreground font-body text-sm">Loading users...</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <Card key={u.id} className="overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-body text-sm font-semibold text-foreground truncate">
                          {u.username || "No name"}
                        </p>
                        <p className="font-body text-xs text-muted-foreground truncate">{u.email}</p>
                        <p className="font-body text-[10px] text-muted-foreground">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant={u.plan === "paid" ? "default" : "secondary"} className="text-[10px]">
                          {u.plan === "paid" ? <Crown size={10} className="mr-0.5" /> : null}
                          {u.plan}
                        </Badge>
                        {u.is_banned && <Badge variant="destructive" className="text-[10px]">Banned</Badge>}
                      </div>
                    </div>

                    <div className="flex gap-3 text-[10px] font-body text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Flame size={10} /> {u.reading_streak} streak</span>
                      <span className="flex items-center gap-0.5"><Gamepad2 size={10} /> {u.games_won} wins</span>
                      <span className="flex items-center gap-0.5"><BookOpen size={10} /> {u.chapters_read} ch.</span>
                      <span className="flex items-center gap-0.5"><Users size={10} /> {u.circles_joined} groups</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 px-2"
                        onClick={() =>
                          handleAction("change_plan", { user_id: u.id, plan: u.plan === "paid" ? "free" : "paid" },
                            `Plan changed to ${u.plan === "paid" ? "free" : "paid"}.`)
                        }
                      >
                        <CreditCard size={10} className="mr-0.5" /> {u.plan === "paid" ? "→ Free" : "→ Paid"}
                      </Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-7 px-2"
                        onClick={() => setMannaDialog({ userId: u.id, username: u.username || u.email })}>
                        <Coins size={10} className="mr-0.5" /> Manna
                      </Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-7 px-2"
                        onClick={() => setConfirmDialog({ action: "reset_streak", userId: u.id, username: u.username || u.email })}>
                        <RotateCcw size={10} className="mr-0.5" /> Reset Streak
                      </Button>
                      {u.is_banned ? (
                        <Button size="sm" variant="outline" className="text-[10px] h-7 px-2"
                          onClick={() => setConfirmDialog({ action: "unban", userId: u.id, username: u.username || u.email })}>
                          Unban
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 text-destructive"
                          onClick={() => setConfirmDialog({ action: "ban", userId: u.id, username: u.username || u.email })}>
                          <Ban size={10} className="mr-0.5" /> Ban
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="text-[10px] h-7 px-2"
                        onClick={() => setConfirmDialog({ action: "delete", userId: u.id, username: u.username || u.email })}>
                        <Trash2 size={10} className="mr-0.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground font-body text-sm py-6">No users found.</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-3 mt-3">
          {loadingAnalytics ? (
            <div className="text-center py-8 text-muted-foreground font-body text-sm">Loading analytics...</div>
          ) : analytics ? (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Users", value: analytics.totalUsers, icon: Users },
                { label: "Active Today", value: analytics.activeToday, icon: Flame },
                { label: "Free Users", value: analytics.freeUsers, icon: Users },
                { label: "Paid Users", value: analytics.paidUsers, icon: Crown },
                { label: "Total Games Played", value: analytics.totalGames, icon: Gamepad2 },
                { label: "Total Manna", value: analytics.totalManna, icon: Coins },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-3 text-center">
                    <stat.icon size={18} className="mx-auto mb-1 text-primary" />
                    <p className="font-display text-lg text-foreground">{stat.value}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </TabsContent>

        {/* TOURNAMENTS TAB */}
        <TabsContent value="tournaments" className="space-y-3 mt-3">
          {tournaments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="font-body text-sm text-muted-foreground">No tournaments yet.</p>
              </CardContent>
            </Card>
          ) : (
            tournaments.map((t) => (
              <Card key={t.id}>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="font-body text-sm flex items-center justify-between">
                    {t.name}
                    <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="flex gap-3 text-[10px] font-body text-muted-foreground">
                    <span>{t.participant_count} players</span>
                    <span>Entry: {t.entry_cost} manna</span>
                    <span>Prize: {t.prize_pool} manna</span>
                  </div>
                  {t.status === "active" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="text-[10px] h-7 px-2"
                        onClick={() => handleAction("end_tournament", { tournament_id: t.id }, "Tournament ended.")}>
                        End Tournament
                      </Button>
                      <Button size="sm" variant="outline" className="text-[10px] h-7 px-2"
                        onClick={() => handleAction("reset_leaderboard", { tournament_id: t.id }, "Leaderboard reset.")}>
                        Reset Leaderboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ECONOMY TAB */}
        <TabsContent value="economy" className="space-y-3 mt-3">
          {analytics ? (
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Total Manna Earned (Games)", value: analytics.mannaEarned, icon: Gamepad2 },
                { label: "Total Manna Purchased", value: analytics.mannaPurchased, icon: CreditCard },
                { label: "Total Manna Spent (Tournaments)", value: analytics.mannaSpent, icon: Trophy },
                { label: "Manna in Circulation", value: analytics.totalManna, icon: Coins },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <stat.icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground">{stat.value}</p>
                      <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground font-body text-sm">Loading...</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Manna Dialog */}
      <Dialog open={!!mannaDialog} onOpenChange={(o) => !o && setMannaDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-base">Manage Manna</DialogTitle>
            <DialogDescription className="font-body text-sm">
              Add or remove manna for {mannaDialog?.username}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            placeholder="Amount"
            value={mannaAmount}
            onChange={(e) => setMannaAmount(e.target.value)}
            className="font-body"
          />
          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => handleManna(false)} disabled={!mannaAmount}>
              <Minus size={14} className="mr-1" /> Remove
            </Button>
            <Button size="sm" onClick={() => handleManna(true)} disabled={!mannaAmount}>
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(o) => !o && setConfirmDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-base">Confirm Action</DialogTitle>
            <DialogDescription className="font-body text-sm">
              Are you sure you want to {confirmDialog?.action === "delete" ? "permanently delete" : confirmDialog?.action}{" "}
              <span className="font-semibold">{confirmDialog?.username}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={executeConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
