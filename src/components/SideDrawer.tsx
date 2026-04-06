import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User, Settings, Shield, HelpCircle, LogOut, Trash2, ShieldAlert, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onAction?: (action: string) => void;
}

const SideDrawer = ({ open, onClose, onOpenSettings, onAction }: SideDrawerProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const menuItems = [
    { label: "Profile", icon: User, action: "profile" },
    { label: "Leaderboard", icon: Trophy, action: "leaderboard" },
    { label: "Prayer Circles", icon: Shield, action: "prayer-circles" },
    ...(isAdmin ? [{ label: "Admin Dashboard", icon: ShieldAlert, action: "admin" }] : []),
    { label: "Settings", icon: Settings, action: "settings" },
    { label: "Help", icon: HelpCircle, action: "help" },
    { label: "Logout", icon: LogOut, action: "logout", destructive: true },
  ];

  const handleClick = (action: string) => {
    if (onAction) {
      onAction(action);
    } else if (action === "settings") {
      onOpenSettings();
      onClose();
    } else {
      onClose();
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
    setConfirmText("");
  };

  const handleConfirmDelete = () => {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    if (onAction) {
      onAction("delete-account");
    }
    setShowDeleteDialog(false);
    setDeleting(false);
    setConfirmText("");
  };

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="font-display text-xl">Eden Bible</DrawerTitle>
            <DrawerDescription className="font-body text-sm">
              {user?.email || "Menu"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleClick(item.action)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-colors text-left ${
                  item.destructive
                    ? "text-destructive hover:bg-destructive/5"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <item.icon size={18} className={item.destructive ? "text-destructive" : "text-primary"} />
                {item.label}
              </button>
            ))}

            {/* Delete Account */}
            {user && (
              <>
                <div className="my-2 border-t border-border" />
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-colors text-left text-destructive hover:bg-destructive/5"
                >
                  <Trash2 size={18} className="text-destructive" />
                  Delete Account
                </button>
              </>
            )}
          </div>
          <DrawerClose />
        </DrawerContent>
      </Drawer>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Account</DialogTitle>
            <DialogDescription className="font-body text-sm">
              Are you sure you want to delete your account? This action cannot be undone. All your data including prayer groups, messages, chat history, and game progress will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="font-body text-sm text-foreground mb-2">
              Type <span className="font-semibold text-destructive">DELETE</span> to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="font-body"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 rounded-xl font-body text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={confirmText !== "DELETE" || deleting}
              className="px-4 py-2 rounded-xl font-body text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting…" : "Delete My Account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SideDrawer;
