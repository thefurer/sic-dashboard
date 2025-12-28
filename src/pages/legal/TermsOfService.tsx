import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";

export default function TermsOfService() {
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
              Términos de Uso
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Última actualización: Diciembre 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                1. Naturaleza del Proyecto
              </h2>
              <p className="text-foreground leading-relaxed">
                Esta plataforma es un <strong>proyecto de tesis</strong> desarrollado por 
                <strong> NAIDELIN CHANCAY BAQUE</strong>, estudiante de la Universidad Estatal 
                del Sur de Manabí (UNESUM), como parte del requisito para la obtención del 
                título profesional.
              </p>
              <p className="text-foreground leading-relaxed mt-2">
                El sistema GISICF (Grupo de Investigación en Sistemas de Información, 
                Comunicación y Formación) tiene como propósito gestionar y evaluar las 
                actividades de investigación de la carrera de Tecnologías de la Información.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                2. Carácter Temporal de la Plataforma
              </h2>
              <p className="text-foreground leading-relaxed">
                <strong>IMPORTANTE:</strong> Esta plataforma tiene un carácter temporal 
                y está activa durante el periodo de presentación de la tesis de 
                <strong> NAIDELIN CHANCAY BAQUE</strong>.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Una vez culminado el proceso de defensa de tesis, la administración 
                  y gestión de la plataforma quedará a disposición de quien la UNESUM 
                  designe como administrador responsable.
                </li>
                <li>
                  Los datos almacenados durante este periodo podrán ser migrados o 
                  respaldados según las políticas institucionales.
                </li>
                <li>
                  La desarrolladora original no se hace responsable del mantenimiento 
                  posterior a la entrega del proyecto.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                3. Limitaciones de Almacenamiento
              </h2>
              <p className="text-foreground leading-relaxed">
                Esta plataforma cuenta con <strong>capacidad de almacenamiento limitada</strong> 
                debido a su naturaleza académica. Por lo tanto:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Los archivos subidos (evidencias, documentos, CV) tienen un límite 
                  de tamaño por archivo.
                </li>
                <li>
                  Se recomienda subir únicamente los documentos estrictamente necesarios.
                </li>
                <li>
                  La administración puede solicitar la eliminación de archivos obsoletos 
                  para liberar espacio.
                </li>
                <li>
                  No se garantiza la disponibilidad permanente de los archivos almacenados.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                4. Uso Aceptable
              </h2>
              <p className="text-foreground leading-relaxed">
                Al utilizar esta plataforma, usted acepta:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Utilizar el sistema únicamente para fines académicos e investigativos.
                </li>
                <li>
                  Proporcionar información veraz y actualizada en su perfil.
                </li>
                <li>
                  No compartir sus credenciales de acceso con terceros.
                </li>
                <li>
                  Respetar los derechos de propiedad intelectual de otros usuarios.
                </li>
                <li>
                  No cargar contenido malicioso, ofensivo o que viole la ley.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                5. Responsabilidades
              </h2>
              <p className="text-foreground leading-relaxed">
                La desarrolladora <strong>NAIDELIN CHANCAY BAQUE</strong> y la UNESUM:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  No se hacen responsables por la pérdida de datos debido a fallas 
                  técnicas o limitaciones del servicio.
                </li>
                <li>
                  No garantizan disponibilidad ininterrumpida del servicio.
                </li>
                <li>
                  Se reservan el derecho de suspender cuentas que violen estos términos.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                6. Modificaciones
              </h2>
              <p className="text-foreground leading-relaxed">
                Estos términos pueden ser modificados sin previo aviso. El uso 
                continuado de la plataforma constituye la aceptación de los 
                términos actualizados.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                7. Contacto
              </h2>
              <p className="text-foreground leading-relaxed">
                Para consultas sobre estos términos, puede contactar a través 
                de los canales oficiales de la carrera de Tecnologías de la 
                Información de la UNESUM.
              </p>
            </section>

            <div className="border-t pt-6 mt-8 text-center text-sm text-muted-foreground">
              <p>© 2024 GISICF - Universidad Estatal del Sur de Manabí</p>
              <p className="mt-1">Proyecto de Tesis - NAIDELIN CHANCAY BAQUE</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}