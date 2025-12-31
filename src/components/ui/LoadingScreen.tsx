import { motion } from "framer-motion";
import gisicfLogo from "@/assets/gisicf-logo.png";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Cargando..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900/90 via-slate-900/95 to-blue-900/90">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Logo container with glow */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,122,51,0.4) 0%, transparent 70%)",
            transform: "scale(2.5)",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [2.2, 2.8, 2.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotating ring */}
        <motion.div
          className="absolute -inset-4 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "rgba(0,122,51,0.6)",
            borderRightColor: "rgba(0,122,51,0.3)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Second rotating ring (opposite direction) */}
        <motion.div
          className="absolute -inset-6 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: "rgba(59,130,246,0.5)",
            borderLeftColor: "rgba(59,130,246,0.2)",
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Logo with pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src={gisicfLogo}
            alt="GISICF Logo"
            className="w-24 h-24 object-contain rounded-full shadow-2xl"
            style={{
              boxShadow: "0 0 40px rgba(0,122,51,0.5), 0 0 80px rgba(0,122,51,0.3)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Loading text */}
      <motion.div
        className="mt-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.p
          className="text-white/90 text-lg font-medium tracking-wide"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="flex gap-1.5 mt-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
