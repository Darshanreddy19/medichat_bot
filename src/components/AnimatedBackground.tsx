import { motion } from "framer-motion";

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <motion.div
      className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30"
      style={{ background: "radial-gradient(circle, hsl(187 72% 42% / 0.4), hsl(221 83% 53% / 0.2))" }}
      animate={{ y: [0, -50, 0], x: [0, 50, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
      style={{ background: "radial-gradient(circle, hsl(271 81% 56% / 0.3), hsl(221 83% 53% / 0.2))" }}
      animate={{ y: [0, 50, 0], x: [0, -50, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl"
      style={{ background: "radial-gradient(circle, hsl(160 60% 45% / 0.15), hsl(187 72% 42% / 0.15))" }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default AnimatedBackground;
