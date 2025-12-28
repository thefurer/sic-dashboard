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
    title: "¡Bienvenido a GISICF!",
    description: "Soy tu asistente virtual. Te guiaré por la plataforma.",
    position: "center",
    robotMessage: "¡Hola! 🤖 Permíteme mostrarte cómo funciona todo.",
    route: "/dashboard",
  },
  {
    id: "sidebar",
    title: "Menú de Navegación",
    description: "Desde aquí accedes a todas las secciones de la plataforma.",
    target: "[data-sidebar='sidebar']",
    position: "bottom-right",
    robotMessage: "Este menú lateral es tu centro de control.",
    route: "/dashboard",
  },
  {
    id: "dashboard",
    title: "Dashboard Principal",
    description: "Aquí verás las noticias y actividades recientes del grupo.",
    position: "bottom-left",
    robotMessage: "El Dashboard es tu página de inicio.",
    route: "/dashboard",
  },
  {
    id: "institutional",
    title: "Información General",
    description: "Consulta misión, visión, objetivos y descarga documentos.",
    position: "bottom-right",
    robotMessage: "Aquí está toda la información institucional.",
    route: "/institutional",
  },
  {
    id: "evaluation",
    title: "Evaluación Anual",
    description: "Completa tu evaluación con indicadores de publicaciones y proyectos.",
    position: "bottom-left",
    robotMessage: "La evaluación anual es importante. Te ayudaré.",
    route: "/evaluation",
  },
  {
    id: "tasks",
    title: "Mis Tareas",
    description: "Visualiza tus tareas asignadas y sube evidencias.",
    position: "bottom-right",
    robotMessage: "Aquí aparecerán las tareas que te asignen.",
    route: "/my-tasks",
  },
  {
    id: "profile",
    title: "Tu Perfil",
    description: "Actualiza tu información personal, foto y CV.",
    position: "bottom-left",
    robotMessage: "Mantén tu perfil actualizado.",
    route: "/profile",
  },
  {
    id: "header-elements",
    title: "Barra Superior",
    description: "Tema, asistente, notificaciones y perfil.",
    target: "[data-tour='notifications']",
    position: "bottom-left",
    robotMessage: "¡Las notificaciones te mantendrán al día!",
    route: "/dashboard",
  },
  {
    id: "finish",
    title: "¡Listo para Comenzar!",
    description: "Explora las secciones. ¡Haz clic en el robot cuando necesites ayuda!",
    position: "center",
    robotMessage: "¡Éxito en tu investigación! 🎉",
    route: "/dashboard",
  },
];

export const adminTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido Admin!",
    description: "Tienes acceso a funciones especiales de gestión.",
    position: "center",
    robotMessage: "¡Hola Admin! 🤖 Tienes superpoderes aquí.",
    route: "/dashboard",
  },
  {
    id: "sidebar",
    title: "Menú de Administración",
    description: "Tu menú incluye secciones adicionales de admin.",
    target: "[data-sidebar='sidebar']",
    position: "bottom-right",
    robotMessage: "Tu menú tiene secciones especiales.",
    route: "/dashboard",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Gestiona las noticias del grupo desde aquí.",
    position: "bottom-left",
    robotMessage: "Puedes gestionar las noticias publicadas.",
    route: "/dashboard",
  },
  {
    id: "pending-approvals",
    title: "Solicitudes Pendientes",
    description: "Aprueba o rechaza nuevos usuarios.",
    position: "bottom-right",
    robotMessage: "Los nuevos usuarios esperan tu aprobación.",
    route: "/admin/pending-approvals",
  },
  {
    id: "user-directory",
    title: "Directorio de Usuarios",
    description: "Gestiona usuarios, roles y permisos.",
    position: "bottom-left",
    robotMessage: "Administra a todos los miembros del grupo.",
    route: "/admin/users",
  },
  {
    id: "evaluation-reviews",
    title: "Revisión de Evaluaciones",
    description: "Revisa y valida evaluaciones de investigadores.",
    position: "bottom-right",
    robotMessage: "Las evaluaciones requieren tu revisión.",
    route: "/admin/evaluations",
  },
  {
    id: "task-reviews",
    title: "Revisión de Tareas",
    description: "Verifica evidencias y proporciona feedback.",
    position: "bottom-left",
    robotMessage: "Revisa las evidencias de los investigadores.",
    route: "/admin/task-reviews",
  },
  {
    id: "planning",
    title: "Planificación",
    description: "Crea planificaciones y asigna responsables.",
    position: "bottom-right",
    robotMessage: "Define las actividades y quién las ejecutará.",
    route: "/admin/planning",
  },
  {
    id: "official-projects",
    title: "Proyectos Oficiales",
    description: "Registra proyectos oficiales del grupo.",
    position: "bottom-left",
    robotMessage: "Los proyectos oficiales cuentan para evaluaciones.",
    route: "/admin/projects-list",
  },
  {
    id: "settings",
    title: "Configuración",
    description: "Configura parámetros institucionales y logos.",
    position: "bottom-right",
    robotMessage: "Personaliza la plataforma.",
    route: "/admin/settings",
  },
  {
    id: "finish",
    title: "¡Panel de Admin Listo!",
    description: "Ya conoces las herramientas. ¡Gestiona eficientemente!",
    position: "center",
    robotMessage: "¡Usa tus poderes sabiamente! 🚀",
    route: "/dashboard",
  },
];
