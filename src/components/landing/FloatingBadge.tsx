import { motion } from "framer-motion";

interface FloatingBadgeProps {
  text: string;
  emoji?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function FloatingBadge({ 
  text, 
  emoji = "🇪🇨", 
  position = "top-right" 
}: FloatingBadgeProps) {
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} z-20`}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, type: "spring" }}
    >
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-white/10"
        animate={{ y: [0, -6, 0] }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-medium text-slate-700 dark:text-white/80">
          {text}
        </span>
      </motion.div>
    </motion.div>
  );
}
