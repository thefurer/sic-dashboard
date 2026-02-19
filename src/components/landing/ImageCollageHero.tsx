import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingBadge } from "./FloatingBadge";
import gisicfLogo from "@/assets/gisicf-logo.png";

const imageSets = [
  [
    { src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop", alt: "Inteligencia Artificial" },
    { src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop", alt: "Circuitos electrónicos" },
    { src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop", alt: "Laboratorio científico" },
    { src: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=400&fit=crop", alt: "Programación" },
    { src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop", alt: "Robot tecnología" },
    { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", alt: "Visualización de datos" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", alt: "Investigador" },
    { src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop", alt: "Red neuronal IA" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop", alt: "Matemáticas y ciencia" },
    { src: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop", alt: "Colaboración tecnológica" },
    { src: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=400&h=300&fit=crop", alt: "Microscopio laboratorio" },
    { src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop", alt: "Código digital" },
    { src: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&h=300&fit=crop", alt: "Tecnología avanzada" },
    { src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=400&fit=crop", alt: "Análisis de datos" },
    { src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop", alt: "Investigación científica" },
    { src: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400&h=300&fit=crop", alt: "Placa electrónica" },
  ],
];

// Position configs for collage: [top, left, width, height, borderRadius, animDelay, floatClass]
const positions = [
  { top: "2%", left: "3%", w: "140px", h: "140px", rounded: "rounded-full", delay: 0, float: "collage-float-1" },
  { top: "5%", left: "28%", w: "160px", h: "110px", rounded: "rounded-3xl", delay: 0.1, float: "collage-float-2" },
  { top: "0%", right: "25%", w: "120px", h: "120px", rounded: "rounded-full", delay: 0.2, float: "collage-float-3" },
  { top: "8%", right: "2%", w: "150px", h: "105px", rounded: "rounded-3xl", delay: 0.3, float: "collage-float-1" },
  { bottom: "5%", left: "5%", w: "150px", h: "105px", rounded: "rounded-3xl", delay: 0.4, float: "collage-float-2" },
  { bottom: "2%", left: "30%", w: "120px", h: "120px", rounded: "rounded-full", delay: 0.5, float: "collage-float-3" },
  { bottom: "8%", right: "28%", w: "140px", h: "100px", rounded: "rounded-3xl", delay: 0.6, float: "collage-float-1" },
  { bottom: "0%", right: "3%", w: "130px", h: "130px", rounded: "rounded-full", delay: 0.7, float: "collage-float-2" },
];

export function ImageCollageHero() {
  const [currentSet, setCurrentSet] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % imageSets.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const images = imageSets[currentSet];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 mesh-gradient-hero" />
      <div className="absolute inset-0 dot-pattern opacity-30 dark:opacity-20" />

      {/* Floating Badge */}
      <FloatingBadge text="Hecho en Ecuador" emoji="🇪🇨" position="top-right" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Collage container */}
        <div className="relative w-full max-w-5xl mx-auto" style={{ minHeight: "600px" }}>
          {/* Images around the edges */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSet}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 hidden md:block"
            >
              {images.map((img, i) => {
                const pos = positions[i];
                return (
                  <motion.div
                    key={img.src}
                    className={`absolute ${pos.rounded} overflow-hidden shadow-xl border-4 border-white/80 dark:border-slate-700/80 ${pos.float}`}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      right: (pos as any).right,
                      bottom: (pos as any).bottom,
                      width: pos.w,
                      height: pos.h,
                    }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: pos.delay, duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.08, zIndex: 10 }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Central text content */}
          <motion.div
            className="relative z-20 flex flex-col items-center justify-center text-center py-16 md:py-24"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Jipijapa — Manabí
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mb-2"
            >
              <img src={gisicfLogo} alt="GISICF" className="w-16 h-16 mx-auto logo-glow" />
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-4 max-w-2xl"
            >
              Gestión de{" "}
              <span className="italic font-serif text-primary">Investigación</span>{" "}
              Inteligente
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-lg md:text-xl text-slate-600 dark:text-white/70 mb-8 max-w-lg"
            >
              Plataforma integral del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link to="/auth">
                <Button
                  size="lg"
                  className="btn-shine bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="flex items-center gap-3 mt-8 text-slate-500 dark:text-white/50"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">U</div>
                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-white text-xs font-bold border-2 border-white dark:border-slate-800">G</div>
                <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">I</div>
              </div>
              <span className="text-sm">UNESUM — Ecuador</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
