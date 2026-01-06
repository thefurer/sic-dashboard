import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Fernando Ayón",
    role: "Investigador Principal",
    quote: "GISICF ha transformado completamente la manera en que gestionamos nuestra producción científica. La detección automática de metadatos nos ahorra horas de trabajo.",
    avatar: "FA",
  },
  {
    name: "Ing. María Rodríguez",
    role: "Coordinadora de Proyectos",
    quote: "La planificación estratégica y el seguimiento de actividades nunca fue tan sencillo. Ahora puedo visualizar el progreso del grupo en tiempo real.",
    avatar: "MR",
  },
  {
    name: "Lcdo. Carlos Mendoza",
    role: "Investigador Asociado",
    quote: "Las notificaciones automáticas y el sistema de evaluación 100/100 me mantienen al día con mis responsabilidades. Una herramienta indispensable.",
    avatar: "CM",
  },
  {
    name: "Dra. Patricia Vera",
    role: "Docente Investigadora",
    quote: "La generación automática de reportes PDF ha simplificado enormemente la documentación de nuestra producción científica anual.",
    avatar: "PV",
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Lo que dicen nuestros <span className="text-primary">investigadores</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/60 max-w-2xl mx-auto">
            Experiencias reales de quienes utilizan GISICF día a día
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-white/10"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-white" />
          </button>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-white/10"
          >
            <ChevronRight className="w-6 h-6 text-slate-600 dark:text-white" />
          </button>

          {/* Testimonial card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-8 md:p-12 text-center"
            >
              <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
              
              <p className="text-xl md:text-2xl text-slate-700 dark:text-white/80 leading-relaxed mb-8 italic">
                "{testimonials[currentIndex].quote}"
              </p>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg shadow-primary/30">
                  {testimonials[currentIndex].avatar}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-slate-500 dark:text-white/50">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
