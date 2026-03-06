import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { User, Settings, BookOpen, Shield, HelpCircle, Info } from "lucide-react";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

const menuItems = [
  { label: "Profile", icon: User, action: "profile" },
  { label: "Settings", icon: Settings, action: "settings" },
  { label: "Bible Version", icon: BookOpen, action: "settings" },
  { label: "Account", icon: Shield, action: "account" },
  { label: "Help", icon: HelpCircle, action: "help" },
  { label: "About", icon: Info, action: "about" },
];

const SideDrawer = ({ open, onClose, onOpenSettings }: SideDrawerProps) => {
  const handleClick = (action: string) => {
    if (action === "settings") {
      onOpenSettings();
    }
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="font-display text-xl">Eden Bible ✨</DrawerTitle>
          <DrawerDescription className="font-body text-sm">Menu & Settings</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item.action)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-foreground hover:bg-muted transition-colors text-left"
            >
              <item.icon size={18} className="text-primary" />
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
