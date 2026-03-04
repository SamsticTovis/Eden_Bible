import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";

const translations = [
  { id: "BSB", name: "Berean Standard" },
  { id: "KJV", name: "King James" },
  { id: "WEB", name: "World English" },
  { id: "ASV", name: "American Standard" },
];

interface TranslationPickerProps {
  value: string;
  onChange: (t: string) => void;
}

const TranslationPicker = ({ value, onChange }: TranslationPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 rounded-xl glass hover:border-primary/30 transition-all">
        <Settings size={16} className="text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-5 w-full max-w-sm shadow-soft"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-foreground">Translation</h3>
                <button onClick={() => setOpen(false)} className="p-1"><X size={16} className="text-muted-foreground" /></button>
              </div>
              <div className="flex flex-col gap-2">
                {translations.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onChange(t.id); setOpen(false); }}
                    className={`flex items-center justify-between p-3 rounded-xl font-body text-sm transition-all ${
                      value === t.id
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "glass text-foreground/80 hover:border-primary/20"
                    }`}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-[10px] font-medium bg-muted/30 px-1.5 py-0.5 rounded-full">{t.id}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TranslationPicker;
