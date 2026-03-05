import { motion } from "framer-motion";
import { Heart, Pill, Stethoscope, Zap, Activity, Droplet } from "lucide-react";

const FloatingIcon = ({ icon: Icon, delay, duration, className }: { icon: any; delay: number; duration: number; className: string }) => (
  <motion.div
    className={`absolute opacity-20 pointer-events-none ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 20, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    <Icon className="w-16 h-16 text-blue-400" strokeWidth={1.5} />
  </motion.div>
);

const AnimatedBackground = () => {
  const icons = [
    { Icon: Heart, delay: 0, duration: 8, className: "top-20 left-10" },
    { Icon: Pill, delay: 1, duration: 10, className: "top-40 right-20" },
    { Icon: Stethoscope, delay: 2, duration: 9, className: "bottom-32 left-1/4" },
    { Icon: Activity, delay: 0.5, duration: 11, className: "top-1/3 right-1/3" },
    { Icon: Droplet, delay: 1.5, duration: 9, className: "bottom-1/4 right-10" },
    { Icon: Zap, delay: 2.5, duration: 10, className: "top-2/3 left-1/3" },
  ];

  return (
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

      {icons.map((item, idx) => (
        <FloatingIcon
          key={idx}
          icon={item.Icon}
          delay={item.delay}
          duration={item.duration}
          className={item.className}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
