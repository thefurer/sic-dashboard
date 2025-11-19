import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, BookOpen, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Innovación y Tecnología al Servicio de la Sociedad
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos (GISICF) - 
            Universidad Estatal del Sur de Manabí
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Acceder a la Plataforma
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Plataforma Integral de Gestión de Investigación
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FolderKanban className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Gestión de Proyectos</CardTitle>
                <CardDescription>
                  Administra y da seguimiento a proyectos de investigación básica, aplicada, 
                  desarrollo tecnológico e innovación.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Producción Científica</CardTitle>
                <CardDescription>
                  Registra artículos indexados (Scopus, WOS, Latindex), libros, 
                  conferencias y patentes de tu grupo de investigación.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Vinculación</CardTitle>
                <CardDescription>
                  Mide el impacto social, ambiental y económico de tus proyectos. 
                  Gestiona convocatorias y evidencias de vinculación.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
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