import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-sm rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5">
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Download size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-foreground">Install Eden Bible</p>
        <p className="font-body text-xs text-muted-foreground">Add to home screen for the full app experience.</p>
      </div>
      <Button size="sm" onClick={install} className="rounded-lg">Install</Button>
      <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPrompt;
