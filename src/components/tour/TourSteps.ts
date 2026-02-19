export interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  robotMessage: string;
  route?: string;
}

export const userTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido/a a GISICF! 🎓",
    description: "Soy GISI, tu asistente virtual del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos. Te guiaré paso a paso por cada sección para que aproveches al máximo la plataforma. ¡Comencemos!",
    position: "center",
    robotMessage: "¡Hola! 👋 Estoy aquí para ayudarte. Este recorrido dura menos de 2 minutos.",
    route: "/dashboard",
  },
  {
    id: "sidebar",
    title: "📋 Menú de Navegación",
    description: "Este es tu centro de control. Desde aquí puedes acceder rápidamente a todas las secciones: dashboard, evaluaciones, tareas, perfil y más. En dispositivos móviles se oculta automáticamente.",
    target: "[data-sidebar='sidebar']",
    position: "bottom-right",
    robotMessage: "Tip: Puedes colapsar el menú para tener más espacio de trabajo.",
    route: "/dashboard",
  },
  {
    id: "dashboard",
    title: "🏠 Tu Panel Principal",
    description: "Aquí encontrarás un resumen de tu actividad: noticias del grupo, tareas pendientes, tu índice de productividad y recomendaciones personalizadas para mejorar tu desempeño investigativo.",
    position: "bottom-left",
    robotMessage: "El dashboard se actualiza en tiempo real con tu progreso.",
    route: "/dashboard",
  },
  {
    id: "institutional",
    title: "🏛️ Información Institucional",
    description: "Consulta la misión, visión y objetivos del grupo de investigación. También puedes descargar documentos oficiales como el plan de trabajo, registro y normativas vigentes.",
    position: "bottom-right",
    robotMessage: "Aquí están los documentos que necesitarás como referencia.",
    route: "/institutional",
  },
  {
    id: "evaluation",
    title: "📊 Evaluación Anual",
    description: "Cada año debes completar tu evaluación con indicadores de publicaciones, proyectos, vinculación y más. El sistema calcula automáticamente tu puntaje según los criterios establecidos.",
    position: "bottom-left",
    robotMessage: "Importante: Completa tu evaluación antes de la fecha límite para evitar observaciones.",
    route: "/evaluation",
  },
  {
    id: "tasks",
    title: "✅ Mis Tareas Asignadas",
    description: "Aquí aparecen las actividades que te han sido asignadas en las planificaciones. Puedes subir evidencias (archivos o enlaces) y hacer seguimiento del estado de cada tarea.",
    position: "bottom-right",
    robotMessage: "Sube tus evidencias a tiempo para que el coordinador pueda revisarlas.",
    route: "/my-tasks",
  },
  {
    id: "profile",
    title: "👤 Tu Perfil Profesional",
    description: "Mantén actualizada tu información: nombre completo, cédula, ORCID, biografía, foto y hoja de vida. Un perfil completo mejora tu visibilidad en el directorio de investigadores.",
    position: "bottom-left",
    robotMessage: "Un perfil completo al 100% te da mejor posicionamiento en el grupo.",
    route: "/profile",
  },
  {
    id: "header-elements",
    title: "🔔 Notificaciones y Herramientas",
    description: "En la barra superior encontrarás: el cambio de tema claro/oscuro, las notificaciones de tareas y evaluaciones, y el acceso rápido a tu perfil.",
    target: "[data-tour='notifications']",
    position: "bottom-left",
    robotMessage: "Revisa tus notificaciones frecuentemente para no perderte nada importante.",
    route: "/dashboard",
  },
  {
    id: "finish",
    title: "🚀 ¡Todo Listo!",
    description: "Ya conoces las secciones principales. Recuerda mantener tu perfil actualizado, completar tus evaluaciones a tiempo y subir las evidencias de tus tareas. ¡Éxito en tu investigación!",
    position: "center",
    robotMessage: "¡Excelente! Si necesitas ayuda, búscame en el menú de accesibilidad. 🎉",
    route: "/dashboard",
  },
];

export const adminTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido/a, Administrador/a! 🛡️",
    description: "Como administrador del grupo GISICF, tienes acceso a herramientas especiales de gestión. Te mostraré cada una para que puedas coordinar eficientemente al equipo de investigación.",
    position: "center",
    robotMessage: "¡Hola Admin! 👋 Tienes funciones exclusivas. Te las muestro en menos de 3 minutos.",
    route: "/dashboard",
  },
  {
    id: "sidebar",
    title: "📋 Menú de Administración",
    description: "Tu menú lateral incluye todas las secciones de usuario más las herramientas administrativas: aprobaciones, directorio, revisiones, planificación y configuración del sistema.",
    target: "[data-sidebar='sidebar']",
    position: "bottom-right",
    robotMessage: "Las secciones de admin están agrupadas en la parte inferior del menú.",
    route: "/dashboard",
  },
  {
    id: "dashboard",
    title: "🏠 Dashboard con Gestión de Noticias",
    description: "Además de ver el resumen general, puedes crear, editar y eliminar noticias que serán visibles para todos los miembros del grupo. Usa el botón 'Gestionar Noticias' para administrarlas.",
    position: "bottom-left",
    robotMessage: "Las noticias son la primera impresión del grupo. Mantenlas actualizadas.",
    route: "/dashboard",
  },
  {
    id: "pending-approvals",
    title: "👥 Solicitudes de Registro",
    description: "Cuando un nuevo usuario se registra, su cuenta queda pendiente de aprobación. Aquí puedes revisar sus datos, aprobar su ingreso al grupo o rechazar la solicitud con una justificación.",
    position: "bottom-right",
    robotMessage: "Revisa las solicitudes pronto para que los nuevos miembros puedan acceder.",
    route: "/admin/pending-approvals",
  },
  {
    id: "user-directory",
    title: "📇 Directorio de Usuarios",
    description: "Visualiza todos los miembros registrados, sus roles (investigador, estudiante, admin), estado de aprobación y perfil completo. Puedes cambiar roles y gestionar permisos desde aquí.",
    position: "bottom-left",
    robotMessage: "Asigna roles correctamente para que cada miembro vea las funciones adecuadas.",
    route: "/admin/users",
  },
  {
    id: "evaluation-reviews",
    title: "📝 Revisión de Evaluaciones",
    description: "Revisa las evaluaciones anuales enviadas por los investigadores. Puedes aprobar, solicitar correcciones con observaciones detalladas o devolver para modificaciones antes de la fecha límite.",
    position: "bottom-right",
    robotMessage: "Sé específico en tus observaciones para facilitar las correcciones.",
    route: "/admin/evaluations",
  },
  {
    id: "task-reviews",
    title: "📋 Revisión de Tareas y Evidencias",
    description: "Verifica las evidencias subidas por los miembros para cada actividad asignada. Puedes aprobar la tarea, solicitar cambios o agregar observaciones para mejorar la calidad del trabajo.",
    position: "bottom-left",
    robotMessage: "Revisa archivos y enlaces de evidencia antes de aprobar cada tarea.",
    route: "/admin/task-reviews",
  },
  {
    id: "planning",
    title: "📅 Planificación Estratégica",
    description: "Crea planes de trabajo con actividades, fechas, objetivos y responsables. Los miembros asignados recibirán notificaciones y podrán ver sus tareas en 'Mis Tareas'.",
    position: "bottom-right",
    robotMessage: "Una buena planificación es clave para el éxito del grupo.",
    route: "/admin/planning",
  },
  {
    id: "official-projects",
    title: "🔬 Proyectos Oficiales",
    description: "Registra los proyectos de investigación oficiales del grupo. Estos proyectos aparecen como opciones en las evaluaciones anuales para que los miembros los vinculen a sus indicadores.",
    position: "bottom-left",
    robotMessage: "Los proyectos oficiales se usan como referencia en las evaluaciones.",
    route: "/admin/projects-list",
  },
  {
    id: "settings",
    title: "⚙️ Configuración del Sistema",
    description: "Personaliza la plataforma: nombre institucional, logos, líneas de investigación, firmas para documentos PDF y enlaces a documentos oficiales descargables.",
    position: "bottom-right",
    robotMessage: "Configura bien los logos y firmas para que los PDF se generen correctamente.",
    route: "/admin/settings",
  },
  {
    id: "finish",
    title: "🎯 ¡Panel de Admin Configurado!",
    description: "Ya conoces todas las herramientas de administración. Recuerda revisar solicitudes pendientes, mantener las noticias actualizadas y dar seguimiento a las evaluaciones y tareas del equipo.",
    position: "center",
    robotMessage: "¡Gestiona con eficiencia! Si necesitas repasar, encuéntrame en accesibilidad. 🚀",
    route: "/dashboard",
  },
];
