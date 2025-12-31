import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, BarChart3, Users, FileCheck, Calendar, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import gisicfLogo from "@/assets/gisicf-logo.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    title: "Dashboard Inteligente",
    description: "Visualiza noticias, novedades y el estado de tu grupo de investigación en tiempo real.",
    image: "/manual-screenshots/dashboard.png",
    icon: BarChart3,
  },
  {
    title: "Directorio de Usuarios",
    description: "Gestiona investigadores, estudiantes y roles con control total de accesos.",
    image: "/manual-screenshots/directorio-usuarios.png",
    icon: Users,
  },
  {
    title: "Revisión de Evaluaciones",
    description: "Aprueba y revisa evaluaciones anuales de los investigadores del grupo.",
    image: "/manual-screenshots/revision-evaluaciones.png",
    icon: FileCheck,
  },
  {
    title: "Planificación Estratégica",
    description: "Crea y administra planes de trabajo con actividades y cronogramas.",
    image: "/manual-screenshots/planificacion.png",
    icon: Calendar,
  },
  {
    title: "Configuración Institucional",
    description: "Personaliza logos, firmas, líneas de investigación y documentos oficiales.",
    image: "/manual-screenshots/configuracion.png",
    icon: Settings,
  },
  {
    title: "Proyectos Oficiales",
    description: "Registra y gestiona proyectos de investigación con documentación completa.",
    image: "/manual-screenshots/proyectos-oficiales.png",
    icon: Shield,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={gisicfLogo} alt="GISICF Logo" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">GISICF</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 dark:text-white/70 hover:text-[hsl(153,100%,24%)] transition-colors font-medium">
              Características
            </a>
            <a href="#about" className="text-slate-600 dark:text-white/70 hover:text-[hsl(153,100%,24%)] transition-colors font-medium">
              Acerca de
            </a>
          </div>

          <Link to="/auth">
            <Button className="bg-[hsl(153,100%,24%)] hover:bg-[hsl(153,100%,28%)] text-white shadow-lg shadow-[hsl(153,100%,24%)]/20">
              Ingresar
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Inspired by Perspective */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 container mx-auto px-6">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Left: Image Collage */}
          <motion.div 
            variants={fadeInUp}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              {/* Main screenshot with overlay effect */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/40">
                <img 
                  src="/manual-screenshots/dashboard.png" 
                  alt="Dashboard GISICF"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
              
              {/* Floating secondary screenshot */}
              <motion.div 
                className="absolute -bottom-8 -right-8 w-2/3 rounded-xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <img 
                  src="/manual-screenshots/revision-evaluaciones.png" 
                  alt="Revisión de Evaluaciones"
                  className="w-full h-auto"
                />
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[hsl(153,100%,24%)]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[hsl(153,100%,35%)]/20 rounded-full blur-xl" />
            </div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div 
            variants={fadeInUp}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              Gestión de{" "}
              <span className="italic font-serif text-[hsl(153,100%,24%)]">Investigación</span>{" "}
              Inteligente
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
              Plataforma integral del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos. 
              Donde la innovación y la tecnología se unen al servicio de la sociedad.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-[hsl(153,100%,24%)] hover:bg-[hsl(153,100%,28%)] text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-[hsl(153,100%,24%)]/30 transition-all hover:shadow-2xl hover:shadow-[hsl(153,100%,24%)]/40 hover:scale-105"
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 text-slate-500 dark:text-white/50">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[hsl(153,100%,24%)] flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">U</div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-white text-xs font-bold border-2 border-white dark:border-slate-800">G</div>
                  <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">I</div>
                </div>
                <span className="text-sm">UNESUM - Ecuador</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Todo lo que Necesitas para{" "}
              <span className="text-[hsl(153,100%,24%)]">Investigar</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-white/60 max-w-2xl mx-auto">
              Una plataforma completa para gestionar proyectos, evaluaciones, planificación y producción científica.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-[hsl(153,100%,24%)]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(153,100%,24%)]/10"
              >
                {/* Screenshot Preview */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-[hsl(153,100%,24%)] flex items-center justify-center shadow-lg shadow-[hsl(153,100%,24%)]/30">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[hsl(153,100%,24%)] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-white/60">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                ¿Por qué <span className="text-[hsl(153,100%,24%)]">GISICF</span>?
              </h2>
              
              <div className="space-y-6 text-slate-600 dark:text-white/70">
                <p>
                  El Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos de la UNESUM 
                  representa una convergencia revolucionaria entre la informática y la ingeniería.
                </p>
                <p>
                  Nuestra plataforma está diseñada para maximizar la transparencia, trazabilidad 
                  e impacto académico de cada proyecto de investigación.
                </p>
                
                <ul className="space-y-3">
                  {[
                    "Gestión integral de proyectos de investigación",
                    "Seguimiento de producción científica",
                    "Evaluación y revisión de actividades",
                    "Planificación estratégica colaborativa",
                    "Generación automática de informes PDF",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[hsl(153,100%,24%)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="/manual-screenshots/perfil.png" 
                  alt="Perfil de Usuario"
                  className="rounded-xl shadow-lg w-full"
                />
                <img 
                  src="/manual-screenshots/info-general.png" 
                  alt="Información General"
                  className="rounded-xl shadow-lg w-full mt-8"
                />
                <img 
                  src="/manual-screenshots/solicitudes-pendientes.png" 
                  alt="Solicitudes Pendientes"
                  className="rounded-xl shadow-lg w-full -mt-4"
                />
                <img 
                  src="/manual-screenshots/revision-actividades.png" 
                  alt="Revisión de Actividades"
                  className="rounded-xl shadow-lg w-full mt-4"
                />
              </div>
              
              {/* Decorative glow */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(153,100%,24%)]/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para Potenciar tu Investigación?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Únete a la plataforma que está transformando la gestión de investigación en la UNESUM.
            </p>
            <Link to="/auth">
              <Button 
                size="lg"
                className="bg-[hsl(153,100%,35%)] hover:bg-[hsl(153,100%,40%)] text-white px-10 py-6 text-lg rounded-full shadow-xl shadow-[hsl(153,100%,35%)]/30"
              >
                Acceder a la Plataforma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={gisicfLogo} alt="GISICF" className="w-10 h-10 rounded-lg" />
              <div>
                <p className="font-bold">GISICF - UNESUM</p>
                <p className="text-xs text-white/50">Sistemas Inteligentes y Ciberfísicos</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-white/60">
                © 2026 Universidad Estatal del Sur de Manabí
              </p>
              <p className="text-xs text-white/40 mt-1">
                Desarrollado por Madelin Chancay Baque
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AccessibilityMenu />
    </div>
  );
}
