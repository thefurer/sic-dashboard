import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccessibilityMenu } from "@/components/accessibility/AccessibilityMenu";

export default function PrivacyPolicy() {
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
              Política de Privacidad
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Última actualización: Diciembre 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none p-6 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                1. Información que Recopilamos
              </h2>
              <p className="text-foreground leading-relaxed">
                La plataforma GISICF recopila la siguiente información para su 
                funcionamiento:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  <strong>Datos de registro:</strong> Nombre completo, correo 
                  electrónico, número de teléfono, código de investigador.
                </li>
                <li>
                  <strong>Información de perfil:</strong> Fotografía, biografía, 
                  curriculum vitae, rol de investigación.
                </li>
                <li>
                  <strong>Datos de actividad:</strong> Proyectos, evaluaciones, 
                  publicaciones, evidencias de investigación.
                </li>
                <li>
                  <strong>Datos técnicos:</strong> Fecha y hora de acceso, 
                  dirección IP (solo para seguridad).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                2. Propósito de la Recopilación
              </h2>
              <p className="text-foreground leading-relaxed">
                Los datos recopilados se utilizan exclusivamente para:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Gestionar el sistema de evaluación de actividades de investigación.
                </li>
                <li>
                  Identificar y autenticar a los usuarios de la plataforma.
                </li>
                <li>
                  Generar reportes académicos y estadísticas de investigación.
                </li>
                <li>
                  Cumplir con los objetivos del proyecto de tesis de 
                  <strong> MADELIN CHANCAY BAQUE</strong>.
                </li>
                <li>
                  Facilitar la comunicación entre investigadores y administradores.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                3. Uso Académico de los Datos
              </h2>
              <p className="text-foreground leading-relaxed">
                Al tratarse de un proyecto de tesis, los datos agregados y 
                anonimizados podrán ser utilizados para:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Análisis estadísticos en el documento de tesis.
                </li>
                <li>
                  Presentaciones académicas y defensa del proyecto.
                </li>
                <li>
                  Publicaciones científicas (siempre de forma anonimizada).
                </li>
              </ul>
              <p className="text-foreground leading-relaxed mt-2">
                <strong>Nota:</strong> En ningún caso se divulgará información 
                personal identificable sin el consentimiento explícito del usuario.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                4. Almacenamiento y Seguridad
              </h2>
              <p className="text-foreground leading-relaxed">
                Sus datos son almacenados de forma segura mediante:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Encriptación de contraseñas y datos sensibles.
                </li>
                <li>
                  Conexiones seguras (HTTPS) para toda la comunicación.
                </li>
                <li>
                  Control de acceso basado en roles (RLS) en la base de datos.
                </li>
                <li>
                  Autenticación obligatoria para acceder a información personal.
                </li>
              </ul>
              <p className="text-foreground leading-relaxed mt-2">
                <strong>Limitación:</strong> Debido a la naturaleza temporal del 
                proyecto, el almacenamiento tiene capacidad limitada y no se 
                garantiza la permanencia indefinida de los datos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                5. Compartición de Datos
              </h2>
              <p className="text-foreground leading-relaxed">
                No compartimos su información personal con terceros, excepto:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Con su consentimiento explícito.
                </li>
                <li>
                  Cuando sea requerido por ley o autoridad competente.
                </li>
                <li>
                  Con administradores autorizados de la plataforma para 
                  propósitos de gestión.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                6. Sus Derechos
              </h2>
              <p className="text-foreground leading-relaxed">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>
                  Acceder a su información personal almacenada.
                </li>
                <li>
                  Solicitar la corrección de datos inexactos.
                </li>
                <li>
                  Solicitar la eliminación de su cuenta y datos asociados.
                </li>
                <li>
                  Retirar su consentimiento en cualquier momento.
                </li>
              </ul>
              <p className="text-foreground leading-relaxed mt-2">
                Para ejercer estos derechos, contacte al administrador de la 
                plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                7. Cookies y Tecnologías Similares
              </h2>
              <p className="text-foreground leading-relaxed">
                La plataforma utiliza cookies técnicas necesarias para:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground">
                <li>Mantener su sesión activa.</li>
                <li>Recordar sus preferencias de accesibilidad.</li>
                <li>Garantizar la seguridad de la aplicación.</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-2">
                No utilizamos cookies de seguimiento ni publicidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">
                8. Contacto
              </h2>
              <p className="text-foreground leading-relaxed">
                Para consultas sobre privacidad, puede contactar a través de 
                los canales oficiales de la carrera de Tecnologías de la 
                Información de la UNESUM.
              </p>
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