import { useState, useRef, useCallback } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mood } from "@/data/bibleVerses";
import MoodSelector from "./MoodSelector";
import VerseDisplay from "./VerseDisplay";
import { motion } from "framer-motion";

const CameraScanner = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      // Camera not available, fallback to manual
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const handleMoodSelect = (mood: Mood) => {
    stopCamera();
    setSelectedMood(mood);
  };

  if (selectedMood) {
    return <VerseDisplay mood={selectedMood} onBack={() => setSelectedMood(null)} />;
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-6">
        <h2 className="font-display text-2xl text-foreground mb-2">Mood Scanner</h2>
        <p className="text-muted-foreground font-body text-sm">
          {cameraActive
            ? "Look at the camera, then tell us how you feel 👇"
            : "Turn on your camera to see yourself, then pick your mood"}
        </p>
      </motion.div>

      {/* Camera preview */}
      <div className="relative mb-6 rounded-2xl overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
        {cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Camera size={40} />
            <p className="font-body text-sm">Camera is off</p>
          </div>
        )}
        <div className="absolute bottom-3 right-3">
          <Button
            size="sm"
            variant={cameraActive ? "destructive" : "default"}
            onClick={cameraActive ? stopCamera : startCamera}
            className="gap-2 font-body"
          >
            {cameraActive ? <><CameraOff size={14} /> Stop</> : <><Camera size={14} /> Start Camera</>}
          </Button>
        </div>
      </div>

      {/* Mood selector below camera */}
      <MoodSelector onSelect={handleMoodSelect} />
    </div>
  );
};

export default CameraScanner;
