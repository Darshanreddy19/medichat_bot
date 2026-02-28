import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Zap, Shield, Brain, Sparkles, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import FeatureCard from "@/components/FeatureCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] as const },
  },
};

const floatingVariants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-20, 20, -20],
    rotate: [0, 5, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get comprehensive medical information and insights in seconds with our advanced AI processing",
  },
  {
    icon: Activity,
    title: "Medication Details",
    description: "Complete dosage, frequency, timing, and duration information for all recommended treatments",
  },
  {
    icon: Brain,
    title: "Smart AI",
    description: "Powered by advanced AI for accurate, evidence-based health information and recommendations",
  },
];

const Index = () => {
  const [showContent, setShowContent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden">
      <AnimatedBackground />

      {/* Cursor glow */}
      <motion.div
        className="fixed pointer-events-none w-64 h-64 rounded-full blur-3xl -z-[5]"
        style={{ background: "radial-gradient(circle, hsl(187 72% 42% / 0.15), hsl(221 83% 53% / 0.1))" }}
        animate={{ x: mousePosition.x - 128, y: mousePosition.y - 128 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      <AnimatePresence mode="wait">
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20"
          >
            {/* Hero */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center max-w-5xl mx-auto"
            >
              {/* Logo */}
              <motion.div variants={itemVariants} className="flex justify-center mb-8">
                <motion.div variants={floatingVariants} initial="initial" animate="animate" className="relative">
                  <motion.div
                    variants={pulseVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 rounded-3xl blur-2xl"
                    style={{ background: "linear-gradient(135deg, hsl(187 72% 42% / 0.4), hsl(221 83% 53% / 0.3))" }}
                  />
                  <div
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center shadow-2xl"
                    style={{
                      background: "var(--gradient-hero)",
                      boxShadow: "0 25px 50px -12px hsl(187 72% 42% / 0.5)",
                    }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                      <Heart className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Heading */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-primary uppercase tracking-widest">Healthcare Innovation</p>
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
                  <span className="gradient-text">MediChat AI</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Your intelligent healthcare companion powered by next-generation AI
                </p>
              </motion.div>

              {/* Subheading */}
              <motion.div variants={itemVariants} className="mb-12 md:mb-16">
                <p className="text-base md:text-lg text-foreground/70 leading-relaxed max-w-3xl mx-auto">
                  Get instant, personalized medical information for chronic diseases. Receive comprehensive treatment
                  plans, medication dosages, timing, and duration tailored to your health needs.
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 60px hsl(187 72% 42% / 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl font-semibold text-primary-foreground inline-flex items-center justify-center gap-2 min-w-[200px] transition-all duration-300"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <span>Start Consultation</span>
                    <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl font-semibold text-foreground bg-secondary hover:bg-accent border border-border transition-all duration-300"
                >
                  Learn More
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground mb-20"
              >
                {[
                  { icon: Shield, label: "HIPAA Compliant" },
                  { icon: Zap, label: "Real-time Analysis" },
                  { icon: Brain, label: "AI Powered" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mb-20"
            >
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose <span className="gradient-text">MediChat?</span>
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {features.map((f) => (
                  <FeatureCard key={f.title} {...f} />
                ))}
              </div>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div variants={itemVariants} className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
              <div className="glass-card p-8 md:p-12 text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  Ready to transform your healthcare experience?
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Get started with MediChat AI today and access personalized medical information anytime.
                </p>
                <Link to="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl font-semibold text-primary-foreground transition-all duration-300"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Begin Your Journey
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 text-primary opacity-30 hover:opacity-100 transition-opacity hidden md:block cursor-pointer"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </main>
  );
};

export default Index;
