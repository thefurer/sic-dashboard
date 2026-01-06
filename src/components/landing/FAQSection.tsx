import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Quién puede acceder a la plataforma?",
    answer: "GISICF está diseñada para investigadores, docentes y estudiantes del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos de la UNESUM. El acceso requiere aprobación del administrador del grupo.",
  },
  {
    question: "¿Cómo se realiza la evaluación anual?",
    answer: "La evaluación se basa en un sistema de 100 puntos que considera publicaciones indexadas, proyectos de investigación, patentes, ponencias y actividades de vinculación. El sistema calcula automáticamente tu puntaje a medida que registras tus actividades.",
  },
  {
    question: "¿Qué bases de datos detecta automáticamente el sistema?",
    answer: "El agente de detección inteligente reconoce automáticamente publicaciones en Scopus, Web of Science, Scielo, Latindex, MIAR, y otras bases de datos indexadas. Solo ingresa el DOI y el sistema extrae los metadatos.",
  },
  {
    question: "¿Cómo puedo registrar mi producción científica?",
    answer: "Desde tu dashboard, accede a la sección de Evaluación y utiliza el formulario inteligente. Puedes ingresar el DOI de tu artículo y el sistema completará automáticamente los datos, o ingresarlos manualmente si prefieres.",
  },
  {
    question: "¿La plataforma genera informes PDF?",
    answer: "Sí, GISICF genera automáticamente reportes PDF personalizados de tu evaluación anual, fichas técnicas de proyectos, y documentación oficial del grupo de investigación con logos institucionales.",
  },
  {
    question: "¿Recibo notificaciones de actividades pendientes?",
    answer: "Sí, el sistema envía notificaciones tanto dentro de la plataforma como por correo electrónico sobre fechas límite, observaciones en evaluaciones, y nuevas actividades asignadas.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Preguntas <span className="text-primary">Frecuentes</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/60 max-w-2xl mx-auto">
            Resolvemos tus dudas sobre la plataforma GISICF
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card border border-slate-200 dark:border-white/10 px-6 rounded-2xl overflow-hidden"
              >
                <AccordionTrigger className="text-left text-slate-900 dark:text-white hover:text-primary transition-colors py-5">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-white/70 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
