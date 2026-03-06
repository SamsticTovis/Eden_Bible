import CommitmentTracker from "./CommitmentTracker";
import { motion } from "framer-motion";

const JourneyPage = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
      <h2 className="font-display text-2xl text-center mb-1 text-foreground">Your Journey</h2>
      <p className="text-center text-muted-foreground font-body mb-6 text-sm">Small steps, big faith 🌱</p>
      <CommitmentTracker />
    </motion.div>
  );
};

export default JourneyPage;
