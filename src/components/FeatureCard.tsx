import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] as const },
  },
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div variants={itemVariants} className="group">
    <div className="glass-card p-6 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(187 72% 42% / 0.2), hsl(221 83% 53% / 0.2))" }}
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <Icon className="w-6 h-6 text-primary" />
        </motion.div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors flex-1">
        {description}
      </p>
      <motion.div
        className="mt-4 pt-4 border-t border-border text-primary opacity-0 group-hover:opacity-100 transition-opacity"
        whileHover={{ x: 5 }}
      >
        <ArrowRight className="w-4 h-4" />
      </motion.div>
    </div>
  </motion.div>
);

export default FeatureCard;
