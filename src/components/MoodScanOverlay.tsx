import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mood, moodEmojis, moodLabels } from "@/data/bibleVerses";
import VerseDisplay from "./VerseDisplay";

const moods: Mood[] = ["happy", "sad", "anxious", "grateful", "angry", "lonely", "hopeful", "tired"];

interface MoodScanOverlayProps {
  open: boolean;
  onClose: () => void;
  onEdenReact: (mood: "happy" | "sad", message: string) => void;
}

const MoodScanOverlay = ({ open, onClose, onEdenReact }: MoodScanOverlayProps) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {}
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    stopCamera();
    setSelectedMood(mood);
    if (mood === "sad" || mood === "lonely" || mood === "anxious") {
      onEdenReact("sad", `I'm here for you. Let God's word bring comfort 💛`);
    } else {
      onEdenReact("happy", `${moodEmojis[mood]} That's wonderful! Here's a verse for you!`);
    }
  };

  const handleClose = () => { stopCamera(); setSelectedMood(null); onClose(); };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-lg overflow-y-auto"
      >
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-foreground">Mood Scanner</h2>
            <button onClick={handleClose} className="p-2 rounded-xl glass">
              <X size={16} className="text-foreground" />
            </button>
          </div>

          {selectedMood ? (
            <VerseDisplay mood={selectedMood} onBack={() => setSelectedMood(null)} />
          ) : (
            <>
              <div className="relative mb-4 rounded-2xl overflow-hidden glass aspect-[4/3] flex items-center justify-center">
                {cameraActive ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Camera size={32} />
                    <p className="font-body text-sm">Camera is off</p>
                  </div>
                )}
                <div className="absolute bottom-3 right-3">
                  <Button
                    size="sm"
                    variant={cameraActive ? "destructive" : "default"}
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="gap-2 font-body rounded-xl text-xs"
                  >
                    {cameraActive ? <><CameraOff size={13} /> Stop</> : <><Camera size={13} /> Start</>}
                  </Button>
                </div>
              </div>

              <p className="font-display font-semibold text-sm text-foreground mb-3">Or tell me how you feel:</p>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((mood) => (
                  <motion.button
                    key={mood}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodSelect(mood)}
                    className="flex items-center gap-3 p-3 rounded-xl glass hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <span className="text-xl">{moodEmojis[mood]}</span>
                    <span className="text-sm font-body font-medium text-foreground/80">{moodLabels[mood]}</span>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MoodScanOverlay;
