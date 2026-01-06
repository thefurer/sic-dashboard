import { motion } from "framer-motion";

const logos = [
  { src: "/logos/logo_unesum.png", alt: "UNESUM" },
  { src: "/logos/logo_carrera_unesum.png", alt: "Carrera UNESUM" },
];

export function LogoMarquee() {
  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="py-12 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-white/5">
      <div className="container mx-auto px-6 mb-8">
        <motion.p
          className="text-center text-slate-500 dark:text-white/50 text-sm font-medium uppercase tracking-wider"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Respaldado por instituciones de excelencia
        </motion.p>
      </div>

      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

        <motion.div
          className="flex items-center gap-16"
          animate={{ x: [0, -50 * logos.length * 4] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="flex-shrink-0 h-16 w-40 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
