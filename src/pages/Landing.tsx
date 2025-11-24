import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, BookOpen, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section - Mejorado */}
      <section className="container mx-auto px-4 py-16 md:py-28">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10"
        >
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Innovación y tecnología al servicio de la sociedad
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-lg">
              Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos (GISICF) — Universidad Estatal del Sur de Manabí. Plataforma para registrar, gestionar y mostrar la producción científica y proyectos de vinculación.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <Link to="/auth" aria-label="Acceder a la plataforma">
                <Button size="lg" className="gap-2">
                  Acceder a la plataforma
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/projects" aria-label="Explorar proyectos" className="inline-flex">
                <button
                  className="text-sm px-4 py-3 rounded-lg border border-transparent bg-transparent hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  Explorar proyectos
                </button>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full md:w-1/2 flex justify-center md:justify-end"
            aria-hidden={true}
          >
            {/* Simple decorative SVG illustration - replaceable por imagen/asset */}
            <svg width="360" height="240" viewBox="0 0 360 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto">
              <rect x="0" y="0" width="360" height="240" rx="16" fill="url(#g)" opacity="0.06"/>
              <g transform="translate(28,22)">
                <circle cx="80" cy="60" r="36" fill="#06b6d4" opacity="0.14" />
                <rect x="140" y="20" width="120" height="80" rx="8" fill="#0f766e" opacity="0.08" />
                <path d="M12 150h220" stroke="#0f766e" strokeWidth="2" opacity="0.12"/>
                <g transform="translate(40,90)">
                  <rect x="0" y="0" width="60" height="36" rx="6" fill="#60a5fa" opacity="0.12" />
                  <rect x="76" y="0" width="92" height="36" rx="6" fill="#06b6d4" opacity="0.12" />
                </g>
              </g>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section con animación en las cards */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Plataforma integral de gestión de investigación
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -6 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FolderKanban className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Gestión de Proyectos</CardTitle>
                <CardDescription>
                  Administra y da seguimiento a proyectos de investigación, desarrollo tecnológico e innovación.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Producción Científica</CardTitle>
                <CardDescription>
                  Registra y muestra artículos, libros, conferencias y patentes de tu grupo de investigación.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-3" />
                <CardTitle>Vinculación</CardTitle>
                <CardDescription>
                  Mide el impacto social, ambiental y económico y gestiona evidencias y convocatorias.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2025 UNESUM - Grupo GISICF. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                U
              </div>
              <span className="font-semibold">UNESUM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}