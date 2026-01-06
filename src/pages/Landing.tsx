import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, BarChart3, Users, FileCheck, Calendar, Settings, Search, Bell, Mail, BookOpen, Leaf, Cpu, Globe, Heart, Lightbulb, FlaskConical, Building, GraduationCap, Zap, Database, Cloud, ChevronLeft, ChevronRight, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";
import gisicfLogo from "@/assets/gisicf-logo.png";
import { useState, useEffect } from "react";
import { AnimatedStats } from "@/components/landing/AnimatedStats";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel";
import { FAQSection } from "@/components/landing/FAQSection";

import { FloatingBadge } from "@/components/landing/FloatingBadge";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};
const features = [{
  title: "Dashboard Inteligente",
  description: "Visualiza noticias, novedades y el estado de tu grupo de investigación en tiempo real.",
  image: "/manual-screenshots/dashboard.png",
  icon: BarChart3
}, {
  title: "Directorio de Usuarios",
  description: "Gestiona investigadores, estudiantes y roles con control total de accesos.",
  image: "/manual-screenshots/directorio-usuarios.png",
  icon: Users
}, {
  title: "Revisión de Evaluaciones",
  description: "Aprueba y revisa evaluaciones anuales de los investigadores del grupo.",
  image: "/manual-screenshots/revision-evaluaciones.png",
  icon: FileCheck
}, {
  title: "Planificación Estratégica",
  description: "Crea y administra planes de trabajo con actividades y cronogramas.",
  image: "/manual-screenshots/planificacion.png",
  icon: Calendar
}, {
  title: "Configuración Institucional",
  description: "Personaliza logos, firmas, líneas de investigación y documentos oficiales.",
  image: "/manual-screenshots/configuracion.png",
  icon: Settings
}, {
  title: "Proyectos Oficiales",
  description: "Registra y gestiona proyectos de investigación con documentación completa.",
  image: "/manual-screenshots/proyectos-oficiales.png",
  icon: Shield
}];
const researchLines = [{
  name: "Salud Pública",
  icon: Heart
}, {
  name: "Educación en Ciencias",
  icon: GraduationCap
}, {
  name: "Biotecnología",
  icon: FlaskConical
}, {
  name: "Ambiente y Biodiversidad",
  icon: Leaf
}, {
  name: "Tecnología de la Información",
  icon: Cpu
}, {
  name: "Inteligencia Artificial",
  icon: Zap
}, {
  name: "Sistemas Ciberfísicos",
  icon: Database
}, {
  name: "Innovación y Emprendimiento",
  icon: Lightbulb
}, {
  name: "Turismo Sostenible",
  icon: Globe
}, {
  name: "Infraestructura",
  icon: Building
}, {
  name: "Cambio Climático",
  icon: Cloud
}, {
  name: "Recursos Hídricos",
  icon: BookOpen
}];
const uniqueFeatures = [{
  icon: Search,
  title: "Búsqueda Inteligente con DOI/ISBN",
  description: "Ingresa un DOI o ISBN y el sistema detecta automáticamente metadatos como título, autores, revista, cuartil y base de datos indexada (Scopus, WOS, Scielo, etc.).",
  highlight: "Agente de detección automática"
}, {
  icon: Mail,
  title: "Notificaciones por Correo",
  description: "Recibe alertas automáticas sobre actividades asignadas, fechas límite próximas y cambios en el estado de tus evaluaciones directamente en tu email.",
  highlight: "Integración con Resend"
}, {
  icon: Bell,
  title: "Sistema de Alertas en Tiempo Real",
  description: "Notificaciones instantáneas cuando tu evaluación tiene observaciones, con indicador visual y detalles específicos de las correcciones requeridas.",
  highlight: "Feedback inmediato"
}, {
  icon: FileCheck,
  title: "Evaluación 100/100 Automatizada",
  description: "Sistema de puntuación inteligente que calcula automáticamente tu progreso y asegura que cumplas todos los indicadores antes de enviar.",
  highlight: "Validación automática"
}];
const footerLinks = {
  platform: [{
    name: "Dashboard",
    href: "#"
  }, {
    name: "Evaluación",
    href: "#"
  }, {
    name: "Proyectos",
    href: "#"
  }, {
    name: "Planificación",
    href: "#"
  }],
  resources: [{
    name: "Manual de Usuario",
    href: "#"
  }, {
    name: "FAQ",
    href: "#faq"
  }, {
    name: "Soporte",
    href: "#"
  }],
  legal: [{
    name: "Política de Privacidad",
    href: "/privacy"
  }, {
    name: "Términos de Servicio",
    href: "/terms"
  }, {
    name: "Aviso Legal",
    href: "/legal"
  }]
};
export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerView = 4;
  const totalSlides = Math.ceil(researchLines.length / itemsPerView);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalSlides]);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  const visibleLines = researchLines.slice(currentSlide * itemsPerView, currentSlide * itemsPerView + itemsPerView);
  return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={gisicfLogo} alt="GISICF Logo" className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">GISICF</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#research-lines" className="text-slate-600 dark:text-white/70 hover:text-primary transition-colors font-medium">
              Líneas
            </a>
            <a href="#features" className="text-slate-600 dark:text-white/70 hover:text-primary transition-colors font-medium">
              Características
            </a>
            <a href="#unique" className="text-slate-600 dark:text-white/70 hover:text-primary transition-colors font-medium">
              Único
            </a>
            <a href="#about" className="text-slate-600 dark:text-white/70 hover:text-primary transition-colors font-medium">
              Acerca de
            </a>
          </div>

          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              Ingresar
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Mesh Gradient */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 mesh-gradient-hero" />
        <div className="absolute inset-0 dot-pattern opacity-30 dark:opacity-20" />
        
        {/* Floating Badge */}
        <FloatingBadge text="Hecho en Ecuador" emoji="🇪🇨" position="top-right" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center" initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Left: Image Collage */}
            <motion.div variants={fadeInUp} className="relative order-2 lg:order-1">
              <div className="relative">
                {/* Glow behind main image */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90" />
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/40">
                  <img src="/manual-screenshots/dashboard.png" alt="Dashboard GISICF" className="w-full h-auto" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
                </div>
                
                <motion.div className="absolute -bottom-8 -right-8 w-2/3 rounded-xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800" initial={{
                opacity: 0,
                scale: 0.8,
                x: 20
              }} animate={{
                opacity: 1,
                scale: 1,
                x: 0
              }} transition={{
                delay: 0.5,
                duration: 0.6
              }}>
                  <img src="/manual-screenshots/revision-evaluaciones.png" alt="Revisión de Evaluaciones" className="w-full h-auto" />
                </motion.div>

                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
              </div>
            </motion.div>

            {/* Right: Text Content */}
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 text-center lg:text-left">
              <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Plataforma de Gestión Científica
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
                Gestión de{" "}
                <span className="italic font-serif text-primary">Investigación</span>{" "}
                Inteligente
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
                Plataforma integral del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos. 
                Donde la innovación y la tecnología se unen al servicio de la sociedad.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/auth">
                  <Button size="lg" className="btn-shine bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:scale-105">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 mt-8 text-slate-500 dark:text-white/50">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">U</div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-white text-xs font-bold border-2 border-white dark:border-slate-800">G</div>
                  <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">I</div>
                </div>
                <span className="text-sm">UNESUM - Ecuador</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <AnimatedStats />

      {/* Logo Marquee */}
      <LogoMarquee />

      {/* Research Lines Carousel Section */}
      <section id="research-lines" className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-white/10">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-10" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Líneas de <span className="text-primary">Investigación</span>
            </h2>
            <p className="text-slate-600 dark:text-white/60">
              Áreas de enfoque del grupo GISICF
            </p>
          </motion.div>

          <div className="relative">
            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-white/10">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
            </button>

            <div className="overflow-hidden mx-8">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{
                opacity: 0,
                x: 50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -50
              }} transition={{
                duration: 0.3
              }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {visibleLines.map((line, index) => <motion.div key={line.name} initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: index * 0.1
                }} className="group flex flex-col items-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
                        <line.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-white/80 text-center">
                        {line.name}
                      </span>
                    </motion.div>)}
                </motion.div>
              </AnimatePresence>
            </div>

            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-white/10">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-white" />
            </button>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({
              length: totalSlides
            }).map((_, i) => <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-primary' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Unique Features Section - Smart Search, Notifications */}
      <section id="unique" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-14" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              ¿Qué nos hace únicos?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Funciones <span className="text-primary">Inteligentes</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-white/60 max-w-2xl mx-auto">
              Automatización avanzada para maximizar tu productividad investigativa
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{
          once: true,
          amount: 0.2
        }}>
            {uniqueFeatures.map((feature, index) => <motion.div key={feature.title} variants={fadeInUp} className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                {/* Highlight Badge */}
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {feature.highlight}
                </span>

                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Todo lo que Necesitas para{" "}
              <span className="text-primary">Investigar</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-white/60 max-w-2xl mx-auto">
              Una plataforma completa para gestionar proyectos, evaluaciones, planificación y producción científica.
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{
          once: true,
          amount: 0.1
        }}>
            {features.map((feature, index) => <motion.div key={feature.title} variants={fadeInUp} whileHover={{
            y: -8,
            transition: {
              duration: 0.3
            }
          }} className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                <div className="relative h-48 overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-white/60">
                    {feature.description}
                  </p>
                </div>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                ¿Por qué <span className="text-primary">GISICF</span>?
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
                  {["Gestión integral de proyectos de investigación", "Seguimiento de producción científica", "Evaluación y revisión de actividades", "Planificación estratégica colaborativa", "Generación automática de informes PDF"].map((item, i) => <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>)}
                </ul>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src="/manual-screenshots/perfil.png" alt="Perfil de Usuario" className="rounded-xl shadow-lg w-full" />
                <img src="/manual-screenshots/info-general.png" alt="Información General" className="rounded-xl shadow-lg w-full mt-8" />
                <img src="/manual-screenshots/solicitudes-pendientes.png" alt="Solicitudes Pendientes" className="rounded-xl shadow-lg w-full -mt-4" />
                <img src="/manual-screenshots/revision-actividades.png" alt="Revisión de Actividades" className="rounded-xl shadow-lg w-full mt-4" />
              </div>
              
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para Potenciar tu Investigación?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Únete a la plataforma que está transformando la gestión de investigación en la UNESUM.
            </p>
            <Link to="/auth">
              <Button size="lg" className="btn-shine bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg rounded-full shadow-xl shadow-primary/30">
                Acceder a la Plataforma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-white/10">
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src={gisicfLogo} alt="GISICF" className="w-12 h-12 rounded-lg" />
                <div>
                  <p className="font-bold text-lg">GISICF</p>
                  <p className="text-xs text-white/50">UNESUM - Ecuador</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos. 
                Transformando la gestión de investigación académica.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5 text-white/70 hover:text-primary" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5 text-white/70 hover:text-primary" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5 text-white/70 hover:text-primary" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5 text-white/70 hover:text-primary" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Plataforma</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map(link => <li key={link.name}>
                    <a href={link.href} className="text-white/60 hover:text-primary transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>)}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Recursos</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map(link => <li key={link.name}>
                    <a href={link.href} className="text-white/60 hover:text-primary transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>)}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Jipijapa, Manabí, Ecuador</span>
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>grupo.gisicf@unesum.edu.ec</span>
                </li>
                <li className="flex items-center gap-3 text-white/60 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+593 985090290</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/50">
                © 2026 Universidad Estatal del Sur de Manabí. Todos los derechos reservados.
              </p>
              
              <div className="flex items-center gap-6">
                {footerLinks.legal.map(link => <Link key={link.name} to={link.href} className="text-xs text-white/40 hover:text-primary transition-colors">
                    {link.name}
                  </Link>)}
              </div>
              
              <p className="text-xs text-white/40">Desarrollado por Madelin Alba Chancay Baque</p>
            </div>
          </div>
        </div>
      </footer>

      <AccessibilityMenu />
    </div>;
}