import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { User, Settings, Shield, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onAction?: (action: string) => void;
}

const SideDrawer = ({ open, onClose, onOpenSettings, onAction }: SideDrawerProps) => {
  const { user } = useAuth();

  const menuItems = [
    { label: "Profile", icon: User, action: "profile" },
    { label: "Prayer Circles", icon: Shield, action: "prayer-circles" },
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

  return (
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
        </div>
        <DrawerClose />
      </DrawerContent>
    </Drawer>
  );
};

export default SideDrawer;
