import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";

export default function LegalNotice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AccessibilityMenu />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex justify-center gap-4 mb-4">
              <img
                src="/logos/logo_unesum.png"
                alt="Logo UNESUM"
                className="h-16 object-contain"
              />
              <img
                src="/logos/logo_carrera_unesum.png"
                alt="Logo Carrera"
                className="h-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Aviso Legal
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Última actualización: Diciembre 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                1. Identificación del Proyecto
              </h2>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  <strong>Nombre del Proyecto:</strong> GISICF - Sistema de Gestión 
                  de Investigación para la Carrera de Tecnologías de la Información
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  <strong>Desarrolladora:</strong> MADELIN CHANCAY BAQUE
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  <strong>Institución:</strong> Universidad Estatal del Sur de Manabí (UNESUM)
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  <strong>Facultad:</strong> Facultad de Ciencias Técnicas
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  <strong>Carrera:</strong> Tecnologías de la Información
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  <strong>Naturaleza:</strong> Proyecto de Tesis para obtención de 
                  título profesional
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                2. Objeto del Proyecto
              </h2>
              <p className="text-foreground leading-relaxed">
                El sistema GISICF ha sido desarrollado como trabajo de titulación 
                con el objetivo de:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Digitalizar y automatizar el proceso de evaluación de actividades 
                  de investigación del grupo GISICF.
                </li>
                <li>
                  Facilitar la gestión de proyectos, publicaciones y actividades 
                  de vinculación.
                </li>
                <li>
                  Generar reportes y estadísticas para la toma de decisiones 
                  institucionales.
                </li>
                <li>
                  Demostrar las competencias técnicas adquiridas durante la 
                  formación profesional.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                3. Periodo de Vigencia
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  <strong>⚠️ AVISO IMPORTANTE:</strong>
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  Esta plataforma está activa durante el periodo de desarrollo y 
                  defensa de tesis de <strong>MADELIN CHANCAY BAQUE</strong>. 
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  Una vez culminado el proceso de titulación:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                  <li>
                    La administración de la plataforma será transferida a quien 
                    la UNESUM designe.
                  </li>
                  <li>
                    La desarrolladora original no tendrá obligación de mantenimiento 
                    ni soporte técnico.
                  </li>
                  <li>
                    La continuidad del servicio dependerá de las decisiones 
                    institucionales.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                4. Limitaciones de Recursos
              </h2>
              <p className="text-foreground leading-relaxed">
                Al ser un proyecto académico, la plataforma tiene las siguientes 
                limitaciones:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  <strong>Almacenamiento limitado:</strong> La capacidad de 
                  almacenamiento de archivos es restringida.
                </li>
                <li>
                  <strong>Recursos de cómputo:</strong> El rendimiento puede 
                  verse afectado en momentos de alta demanda.
                </li>
                <li>
                  <strong>Sin garantía de disponibilidad 24/7:</strong> Pueden 
                  ocurrir interrupciones por mantenimiento o actualizaciones.
                </li>
                <li>
                  <strong>Soporte técnico limitado:</strong> El soporte está 
                  condicionado al periodo de desarrollo de la tesis.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                5. Propiedad Intelectual
              </h2>
              <p className="text-foreground leading-relaxed">
                El código fuente, diseño y documentación del sistema GISICF son 
                propiedad intelectual de:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  <strong>MADELIN CHANCAY BAQUE</strong> - Como desarrolladora 
                  del proyecto.
                </li>
                <li>
                  <strong>Universidad Estatal del Sur de Manabí</strong> - Como 
                  institución auspiciante, según las políticas de la universidad 
                  sobre trabajos de titulación.
                </li>
              </ul>
              <p className="text-foreground leading-relaxed mt-2">
                Los logos, escudos e imágenes institucionales son propiedad de 
                la UNESUM y se utilizan con fines académicos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                6. Exención de Responsabilidad
              </h2>
              <p className="text-foreground leading-relaxed">
                La desarrolladora y la UNESUM:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  No garantizan la disponibilidad ininterrumpida del servicio.
                </li>
                <li>
                  No se responsabilizan por pérdida de datos o información.
                </li>
                <li>
                  No asumen responsabilidad por daños derivados del uso del sistema.
                </li>
                <li>
                  Se reservan el derecho de modificar o suspender el servicio 
                  sin previo aviso.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                7. Legislación Aplicable
              </h2>
              <p className="text-foreground leading-relaxed">
                Este aviso legal se rige por las leyes de la República del Ecuador. 
                Cualquier controversia será sometida a los tribunales competentes 
                de la ciudad de Jipijapa, provincia de Manabí.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                8. Contacto Institucional
              </h2>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  <strong>Universidad Estatal del Sur de Manabí</strong>
                </p>
                <p className="text-foreground leading-relaxed">
                  Facultad de Ciencias Técnicas
                </p>
                <p className="text-foreground leading-relaxed">
                  Carrera de Tecnologías de la Información
                </p>
                <p className="text-foreground leading-relaxed mt-2">
                  Km 1 ½ Vía Noboa - Campus Los Ángeles
                </p>
                <p className="text-foreground leading-relaxed">
                  Jipijapa, Manabí, Ecuador
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8 text-center text-sm text-muted-foreground">
              <p>© 2024 GISICF - Universidad Estatal del Sur de Manabí</p>
              <p className="mt-1">Proyecto de Tesis - MADELIN CHANCAY BAQUE</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}