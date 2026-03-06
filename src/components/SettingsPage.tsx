import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Type, BookOpen } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem("eden-fontsize") || "16", 10));
  const [defaultVersion, setDefaultVersion] = useState(() => localStorage.getItem("eden-version") || "BSB");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("eden-darkmode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("eden-fontsize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("eden-version", defaultVersion);
  }, [defaultVersion]);

  const versions = ["BSB", "KJV", "WEB", "ASV"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
      <h2 className="font-display text-2xl text-center mb-1 text-foreground">Settings</h2>
      <p className="text-center text-muted-foreground font-body mb-6 text-sm">Customize your experience ⚙️</p>

      <div className="flex flex-col gap-4">
        {/* Theme */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
              <div>
                <p className="font-body font-medium text-foreground text-sm">Appearance</p>
                <p className="font-body text-xs text-muted-foreground">{darkMode ? "Dark mode" : "Light mode"}</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-border"}`}
            >
              <motion.div
                className="w-5 h-5 bg-primary-foreground rounded-full absolute top-1"
                animate={{ left: darkMode ? 26 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Font size */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Type size={18} className="text-primary" />
            <div>
              <p className="font-body font-medium text-foreground text-sm">Font Size</p>
              <p className="font-body text-xs text-muted-foreground">{fontSize}px</p>
            </div>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={([v]) => setFontSize(v)}
            min={12}
            max={24}
            step={1}
          />
        </div>

        {/* Default Bible version */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen size={18} className="text-primary" />
            <div>
              <p className="font-body font-medium text-foreground text-sm">Bible Version</p>
              <p className="font-body text-xs text-muted-foreground">Default translation</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {versions.map((v) => (
              <button
                key={v}
                onClick={() => setDefaultVersion(v)}
                className={`py-2 rounded-xl font-body text-sm font-medium transition-all ${
                  defaultVersion === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
