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
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl bg-muted border-2 border-border hover:border-primary/40 transition-all"
      >
        <Settings size={18} className="text-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border-2 border-border rounded-2xl p-5 w-full max-w-sm shadow-bold"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-extrabold text-lg text-foreground">Translation</h3>
                <button onClick={() => setOpen(false)} className="p-1"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="flex flex-col gap-2">
                {translations.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onChange(t.id); setOpen(false); }}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 font-body font-bold text-sm transition-all ${
                      value === t.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-card border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-full">{t.id}</span>
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
