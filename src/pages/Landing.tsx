import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, BookOpen, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
const heroTextVariant = {
  hidden: {
    opacity: 0,
    x: -40
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6
    }
  }
};
const heroImageVariant = {
  hidden: {
    opacity: 0,
    x: 40,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7
    }
  }
};
const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};
const cardVariant = {
  hidden: {
    opacity: 0,
    y: 18
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  },
  hover: {
    y: -8,
    boxShadow: "0 20px 40px rgba(2, 50, 32, 0.18)"
  }
};
export default function Landing() {
  return <div className="min-h-screen relative" style={{
    // subtle dot grid + mesh gradient background to imply connectivity/data
    background: "radial-gradient(circle at 10% 10%, rgba(0,122,51,0.03), transparent 8%), radial-gradient(circle at 90% 90%, rgba(6,182,212,0.02), transparent 8%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)"
  }}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <motion.div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10" initial="hidden" animate="visible">
          <motion.div variants={heroTextVariant} className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              <span className="inline-block mr-3">
                <span style={{
                background: "linear-gradient(90deg,#007A33,#06b6d4)",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}>
                  Innovación
                </span>
                {" y tecnología al servicio de la "}
              </span>
              <span style={{
              background: "linear-gradient(90deg,#007A33,#06b6d4)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
                Sociedad
              </span>
            </h1>

            <p className="text-lg text-slate-700 mb-6 max-w-lg">
              Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos (GISICF) — Universidad Estatal del Sur de Manabí. Plataforma para registrar, gestionar y mostrar la producción científica y proyectos de vinculación.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <Link to="/auth" aria-label="Acceder a la plataforma" className="relative">
                <Button size="lg" className="gap-2 relative z-10" style={{
                // glow + primary green brand color
                backgroundColor: "#007A33",
                color: "white",
                boxShadow: "0 8px 30px rgba(0,122,51,0.18)"
              }}>
                  Acceder a la plataforma
                  <ArrowRight className="h-5 w-5" />
                </Button>
                {/* soft glow ring */}
                <span aria-hidden style={{
                position: "absolute",
                left: -6,
                right: -6,
                top: -6,
                bottom: -6,
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,122,51,0.08)",
                zIndex: 0
              }} />
              </Link>

              <Link to="/projects" aria-label="Explorar proyectos" className="inline-flex group">
                <span className="relative inline-block text-sm text-slate-800">
                  <span className="relative z-10">Explorar proyectos</span>
                  <span className="absolute left-0 -bottom-0.5 h-0.5 bg-[#007A33] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{
                  width: "100%"
                }} />
                </span>
              </Link>
            </div>
          </motion.div>

          <motion.div variants={heroImageVariant} className="w-full md:w-1/2 flex justify-center md:justify-end" aria-hidden={true}>
            {/* Decorative tech visualization - connected nodes / glass panels */}
            <div className="relative rounded-2xl p-6" style={{
            width: 420,
            maxWidth: "100%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.42))",
            boxShadow: "0 20px 50px rgba(2,8,23,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,0,0,0.06)"
          }}>
              {/* Simple connected nodes SVG - modernized */}
              <svg viewBox="0 0 420 260" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#007A33" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="b" />
                    <feBlend in="SourceGraphic" in2="b" />
                  </filter>
                </defs>

                {/* glass panels */}
                <rect x="10" y="18" rx="12" width="200" height="120" fill="url(#g1)" opacity="0.06" transform="rotate(-6 10 18)" />
                <rect x="160" y="40" rx="10" width="220" height="120" fill="#0f172a" opacity="0.06" transform="rotate(6 160 40)" />

                {/* connected nodes */}
                <g stroke="#94f2d0" strokeWidth="2" fill="none" strokeOpacity="0.9" transform="translate(14,20)">
                  <line x1="40" y1="40" x2="120" y2="20" />
                  <line x1="120" y1="20" x2="200" y2="56" />
                  <line x1="200" y1="56" x2="280" y2="20" />
                  <line x1="120" y1="20" x2="120" y2="110" />
                </g>

                <g transform="translate(14,20)">
                  <circle cx="40" cy="40" r="8" fill="#007A33" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="120" cy="20" r="10" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="200" cy="56" r="7" fill="#007A33" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="280" cy="20" r="9" fill="#0ea5a3" stroke="#ffffff" strokeWidth="2" />
                </g>

                {/* floating glass tiles */}
                <g transform="translate(20,120)">
                  <rect x="0" y="0" rx="8" width="100" height="60" fill="rgba(255,255,255,0.14)" />
                  <rect x="120" y="12" rx="8" width="150" height="72" fill="rgba(6,182,212,0.06)" />
                </g>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800">
          Plataforma integral de gestión de investigación
        </h2>

        <motion.div variants={cardsContainer} initial="hidden" whileInView="visible" viewport={{
        once: true,
        amount: 0.12
      }} className="grid md:grid-cols-3 gap-6">
          <motion.div variants={cardVariant} whileHover="hover">
            <Card className="transition-shadow rounded-xl" style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            padding: "1.25rem"
          }}>
              <CardHeader className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-full" style={{
                width: 64,
                height: 64,
                background: "#eafaf0",
                border: "1px solid rgba(0,122,51,0.06)",
                flexShrink: 0
              }}>
                  <FolderKanban className="h-7 w-7" style={{
                  color: "#007A33"
                }} />
                </div>

                <div>
                  <CardTitle className="text-lg">Gestión de Proyectos</CardTitle>
                  <CardDescription className="text-slate-700">
                    Administra y da seguimiento a proyectos de investigación, desarrollo tecnológico e innovación.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariant} whileHover="hover">
            <Card className="transition-shadow rounded-xl" style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            padding: "1.25rem"
          }}>
              <CardHeader className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-full" style={{
                width: 64,
                height: 64,
                background: "#e9f8ff",
                border: "1px solid rgba(6,182,212,0.06)",
                flexShrink: 0
              }}>
                  <BookOpen className="h-7 w-7" style={{
                  color: "#0f766e"
                }} />
                </div>

                <div>
                  <CardTitle className="text-lg">Producción Científica</CardTitle>
                  <CardDescription className="text-slate-700">
                    Registra y muestra artículos, libros, conferencias y patentes de tu grupo de investigación.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariant} whileHover="hover">
            <Card className="transition-shadow rounded-xl" style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            padding: "1.25rem"
          }}>
              <CardHeader className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-full" style={{
                width: 64,
                height: 64,
                background: "#f0fdf4",
                border: "1px solid rgba(0,122,51,0.06)",
                flexShrink: 0
              }}>
                  <Users className="h-7 w-7" style={{
                  color: "#007A33"
                }} />
                </div>

                <div>
                  <CardTitle className="text-lg">Vinculación</CardTitle>
                  <CardDescription className="text-slate-700">
                    Mide el impacto social, ambiental y económico y gestiona evidencias y convocatorias.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-16">
        <div className="w-full bg-slate-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm opacity-90">© 2025 UNESUM - Grupo GISICF. Todos los derechos reservados.</p>
                  <p className="text-xs opacity-70 mt-2">
                    Proyecto de Tesis - NAIDELIN CHANCAY BAQUE
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#007A33] flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                  <span className="font-semibold">UNESUM</span>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <nav className="flex flex-wrap justify-center gap-4 text-sm">
                  <Link 
                    to="/legal/terms" 
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Términos de Uso
                  </Link>
                  <span className="opacity-30">|</span>
                  <Link 
                    to="/legal/privacy" 
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Política de Privacidad
                  </Link>
                  <span className="opacity-30">|</span>
                  <Link 
                    to="/legal/notice" 
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Aviso Legal
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <AccessibilityMenu />
    </div>;
}