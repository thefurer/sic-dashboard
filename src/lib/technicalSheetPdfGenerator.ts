import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  drawManualCover,
  drawManualPageHeader,
  drawManualPageFooter,
  addSectionTitle,
  addSubsectionTitle,
  addParagraph,
  addBulletList,
  addNumberedList,
  addInfoBox,
  ManualCoverData,
  CONTACT_EMAIL,
} from "./manualCoverGenerator";

export async function generateTechnicalSheetPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover page
  const coverData: ManualCoverData = {
    title: "FICHA TÉCNICA",
    subtitle: "Especificaciones técnicas, arquitectura y guía de migraciones",
    version: "2.0",
    date: new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long" }),
    documentType: "ficha_tecnica",
  };

  await drawManualCover(doc, coverData);

  // Section 1: General Information
  doc.addPage();
  let y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "INFORMACIÓN GENERAL", y, 1);

  autoTable(doc, {
    startY: y,
    body: [
      ["Nombre del Sistema", "GISICF - Gestión de Investigación Científica y Formativa"],
      ["Versión", "2.0.0"],
      ["Tipo de Aplicación", "Single Page Application (SPA) con Backend as a Service"],
      ["Propósito", "Gestión integral de actividades de investigación"],
      ["Institución", "Universidad Estatal del Sur de Manabí (UNESUM)"],
      ["Facultad", "Facultad de Ciencias Técnicas"],
      ["Carrera", "Tecnologías de la Información"],
      ["Grupo de Investigación", "Sistemas Inteligentes y Ciberfísicos (GISICF)"],
      ["URL de Producción", "https://gisicf.lovable.app"],
      ["Fecha de Última Actualización", new Date().toLocaleDateString("es-EC")],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [240, 248, 255], cellWidth: 60 },
      1: { cellWidth: 115 },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  y = addSectionTitle(doc, "DESCRIPCIÓN DEL SISTEMA", y, 2);

  y = addParagraph(
    doc,
    "GISICF es una plataforma web desarrollada para automatizar y optimizar la gestión de las actividades de investigación del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos. El sistema permite el registro, seguimiento y evaluación de la producción científica, implementando un dashboard inteligente con recomendaciones personalizadas y gamificación.",
    y
  );

  y = addSubsectionTitle(doc, "Funcionalidades Principales", y + 5, "2.1");

  y = addBulletList(doc, [
    "Dashboard inteligente con recomendaciones personalizadas y gamificación",
    "Sistema de evaluación anual multi-categoría con wizard de 5 pasos",
    "Planificación estratégica con asignación automática de tareas",
    "Gestión de proyectos oficiales vinculados a evaluaciones",
    "Directorio de investigadores con validación ORCID en tiempo real",
    "Sistema de notificaciones y cola de prioridad de tareas",
    "Generación automática de reportes PDF con formato institucional",
    "Panel de administración con RBAC y Row Level Security",
    "Índice de productividad y sistema de logros (badges)",
  ], y);

  // Section 3: Technical Architecture
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "ARQUITECTURA TECNOLÓGICA", y, 3);

  y = addSubsectionTitle(doc, "Stack Tecnológico Frontend", y, "3.1");

  autoTable(doc, {
    startY: y,
    head: [["Tecnología", "Versión", "Propósito"]],
    body: [
      ["React", "18.3.x", "Biblioteca UI principal con hooks y componentes funcionales"],
      ["TypeScript", "5.x", "Tipado estático para mayor robustez del código"],
      ["Vite", "5.x", "Bundler y servidor de desarrollo con HMR"],
      ["Tailwind CSS", "3.x", "Framework de utilidades CSS con diseño responsivo"],
      ["shadcn/ui", "Latest", "Componentes UI accesibles basados en Radix"],
      ["TanStack Query", "5.x", "Gestión de estado del servidor con caché inteligente"],
      ["React Router", "6.x", "Enrutamiento declarativo SPA"],
      ["Framer Motion", "12.x", "Animaciones fluidas y transiciones"],
      ["React Hook Form", "7.x", "Gestión de formularios con validación Zod"],
      ["Recharts", "2.x", "Visualización de datos y gráficos"],
      ["jsPDF", "3.x", "Generación de documentos PDF en cliente"],
      ["date-fns", "3.x", "Manipulación de fechas con localización español"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Stack Tecnológico Backend (Supabase)", y, "3.2");

  autoTable(doc, {
    startY: y,
    head: [["Servicio", "Tecnología", "Propósito"]],
    body: [
      ["Base de Datos", "PostgreSQL 15.x", "Almacenamiento relacional con extensiones"],
      ["Autenticación", "Supabase Auth", "JWT, OAuth, recuperación de contraseña"],
      ["Storage", "Supabase Storage", "Almacenamiento de archivos con buckets"],
      ["Edge Functions", "Deno Runtime", "Funciones serverless para lógica de negocio"],
      ["Realtime", "PostgreSQL LISTEN/NOTIFY", "Suscripciones en tiempo real"],
      ["Row Level Security", "PostgreSQL RLS", "Seguridad a nivel de fila"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Diagrama de Arquitectura", y, "3.3");

  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  
  const diagram = [
    "┌─────────────────────────────────────────────────────────────────┐",
    "│                     CLIENTE (Browser SPA)                       │",
    "│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │",
    "│  │   React   │ │  TanStack │ │   React   │ │    Framer     │   │",
    "│  │Components │ │   Query   │ │   Router  │ │    Motion     │   │",
    "│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └───────────────┘   │",
    "│        └─────────────┴─────────────┘                            │",
    "│                        │                                        │",
    "│              ┌─────────▼─────────┐                              │",
    "│              │  Supabase Client  │                              │",
    "│              │   (SDK + Types)   │                              │",
    "│              └─────────┬─────────┘                              │",
    "└────────────────────────┼────────────────────────────────────────┘",
    "                         │ HTTPS / WSS",
    "┌────────────────────────▼────────────────────────────────────────┐",
    "│                    SUPABASE CLOUD                               │",
    "│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │",
    "│  │   Auth    │ │  Database │ │  Storage  │ │ Edge Functions│   │",
    "│  │ (JWT/RLS) │ │(PostgreSQL)│ │ (Buckets) │ │    (Deno)     │   │",
    "│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │",
    "│                                                                 │",
    "│  ┌─────────────────────────────────────────────────────────┐   │",
    "│  │              Row Level Security (RLS)                    │   │",
    "│  │    Políticas por tabla + Función has_role() + Triggers   │   │",
    "│  └─────────────────────────────────────────────────────────┘   │",
    "└─────────────────────────────────────────────────────────────────┘",
  ];

  diagram.forEach((line) => {
    doc.text(line, 15, y);
    y += 3.5;
  });

  doc.setFont("helvetica", "normal");

  // Section 4: Database Schema
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "MODELO DE DATOS", y, 4);

  y = addParagraph(
    doc,
    "El sistema utiliza PostgreSQL como base de datos relacional con Row Level Security habilitado en todas las tablas críticas.",
    y
  );

  y = addSubsectionTitle(doc, "Tablas Principales", y + 5, "4.1");

  autoTable(doc, {
    startY: y,
    head: [["Tabla", "Descripción", "RLS"]],
    body: [
      ["profiles", "Información de usuarios (nombre, ORCID, país, CV)", "Sí"],
      ["profile_contacts", "Contacto de usuarios (email, teléfono)", "Sí"],
      ["user_roles", "Roles de usuarios (admin, researcher, student)", "Sí"],
      ["projects", "Proyectos de investigación personales", "Sí"],
      ["official_projects", "Proyectos oficiales del grupo", "Sí"],
      ["evaluation_reports", "Informes de evaluación anual", "Sí"],
      ["evaluation_items", "Ítems individuales de evaluación", "Sí"],
      ["planning_sheets", "Planes de trabajo/planificación", "Sí"],
      ["planning_activities", "Actividades de cada plan", "Sí"],
      ["planning_members", "Miembros asignados a cada plan", "Sí"],
      ["assigned_tasks", "Tareas asignadas a usuarios", "Sí"],
      ["news_posts", "Noticias y comunicados del grupo", "Sí"],
      ["app_settings", "Configuración global del sistema", "Sí"],
      ["documents", "Documentos institucionales", "Sí"],
      ["scientific_books", "Libros científicos registrados", "Sí"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 7, cellPadding: 2 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Funciones de Base de Datos", y, "4.2");

  autoTable(doc, {
    startY: y,
    head: [["Función", "Tipo", "Propósito"]],
    body: [
      ["has_role(user_id, role)", "SECURITY DEFINER", "Verificar rol de usuario sin recursión RLS"],
      ["handle_new_user()", "TRIGGER", "Crear perfil y contacto al registrar usuario"],
      ["sync_director_admin_role()", "TRIGGER", "Sincronizar rol admin con Director de Proyecto"],
      ["update_updated_at_column()", "TRIGGER", "Actualizar timestamp en modificaciones"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  // Section 5: Migrations Guide
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "GUÍA DE MIGRACIONES", y, 5);

  y = addParagraph(
    doc,
    "Las migraciones son scripts SQL que modifican la estructura de la base de datos. En Lovable/Supabase, las migraciones se gestionan a través de archivos en la carpeta supabase/migrations/.",
    y
  );

  y = addSubsectionTitle(doc, "Estructura de Migraciones", y + 5, "5.1");

  y = addBulletList(doc, [
    "Ubicación: supabase/migrations/",
    "Formato de nombre: YYYYMMDDHHMMSS_descripcion.sql",
    "Ejemplo: 20250124120000_add_user_achievements.sql",
    "Las migraciones se ejecutan en orden cronológico",
    "Una vez ejecutada, una migración no debe modificarse",
  ], y);

  y = addSubsectionTitle(doc, "Crear una Nueva Migración", y + 5, "5.2");

  y = addNumberedList(doc, [
    "En Lovable, solicite al AI crear una migración describiendo los cambios",
    "El AI generará el SQL y lo guardará en supabase/migrations/",
    "Revise el SQL generado antes de aprobar",
    "Apruebe la migración para que se ejecute en la base de datos",
    "Verifique que los cambios se aplicaron correctamente",
  ], y);

  y = addSubsectionTitle(doc, "Ejemplo de Migración: Crear Tabla", y + 5, "5.3");

  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  
  const migrationExample = [
    "-- Crear tabla de logros de usuario",
    "CREATE TABLE public.user_achievements (",
    "  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),",
    "  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,",
    "  achievement_id TEXT NOT NULL,",
    "  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),",
    "  UNIQUE(user_id, achievement_id)",
    ");",
    "",
    "-- Habilitar RLS",
    "ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;",
    "",
    "-- Crear política: usuarios ven solo sus logros",
    "CREATE POLICY \"Users can view own achievements\"",
    "  ON public.user_achievements FOR SELECT",
    "  USING (auth.uid() = user_id);",
  ];

  migrationExample.forEach((line) => {
    doc.text(line, 20, y);
    y += 3.5;
  });

  doc.setFont("helvetica", "normal");

  y += 5;

  y = addInfoBox(
    doc,
    "Importante",
    "Siempre incluya RLS en las tablas nuevas. Use la función has_role() para verificar roles de administrador sin causar recursión en las políticas.",
    y,
    "warning"
  );

  // Section 6: Migrations - Advanced
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSubsectionTitle(doc, "Migración: Agregar Columna", y, "5.4");

  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  
  const addColumnExample = [
    "-- Agregar columna a tabla existente",
    "ALTER TABLE public.profiles",
    "  ADD COLUMN IF NOT EXISTS research_area TEXT;",
    "",
    "-- Agregar columna con valor por defecto",
    "ALTER TABLE public.evaluation_reports",
    "  ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100;",
  ];

  addColumnExample.forEach((line) => {
    doc.text(line, 20, y);
    y += 3.5;
  });

  doc.setFont("helvetica", "normal");

  y += 10;

  y = addSubsectionTitle(doc, "Migración: Crear Trigger", y, "5.5");

  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  
  const triggerExample = [
    "-- Crear función trigger",
    "CREATE OR REPLACE FUNCTION public.update_updated_at()",
    "RETURNS TRIGGER AS $$",
    "BEGIN",
    "  NEW.updated_at = now();",
    "  RETURN NEW;",
    "END;",
    "$$ LANGUAGE plpgsql SECURITY DEFINER;",
    "",
    "-- Crear trigger en tabla",
    "CREATE TRIGGER update_profiles_updated_at",
    "  BEFORE UPDATE ON public.profiles",
    "  FOR EACH ROW",
    "  EXECUTE FUNCTION public.update_updated_at();",
  ];

  triggerExample.forEach((line) => {
    doc.text(line, 20, y);
    y += 3.5;
  });

  doc.setFont("helvetica", "normal");

  y += 10;

  y = addSubsectionTitle(doc, "Migración: Políticas RLS con Roles", y, "5.6");

  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  
  const rlsExample = [
    "-- Política para administradores (usando has_role)",
    "CREATE POLICY \"Admins can manage all\"",
    "  ON public.some_table",
    "  FOR ALL",
    "  TO authenticated",
    "  USING (public.has_role(auth.uid(), 'admin'));",
    "",
    "-- Política para usuarios (solo sus registros)",
    "CREATE POLICY \"Users manage own records\"",
    "  ON public.some_table",
    "  FOR ALL",
    "  TO authenticated",
    "  USING (auth.uid() = user_id);",
  ];

  rlsExample.forEach((line) => {
    doc.text(line, 20, y);
    y += 3.5;
  });

  doc.setFont("helvetica", "normal");

  // Section 7: System Modules
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "MÓDULOS DEL SISTEMA", y, 6);

  autoTable(doc, {
    startY: y,
    head: [["Módulo", "Ruta", "Componente", "Acceso"]],
    body: [
      ["Dashboard", "/dashboard", "Dashboard.tsx", "Todos"],
      ["Información GISICF", "/institutional", "Institutional.tsx", "Todos"],
      ["Evaluación", "/evaluation", "Evaluation.tsx", "Investigadores"],
      ["Mis Tareas", "/my-tasks", "MyTasks.tsx", "Todos"],
      ["Proyectos", "/projects", "OfficialProjects.tsx", "Todos"],
      ["Investigadores", "/researchers", "ResearcherDirectory.tsx", "Todos"],
      ["Perfil", "/profile", "Profile.tsx", "Todos"],
      ["Solicitudes", "/admin/pending-approvals", "PendingApprovals.tsx", "Admin"],
      ["Directorio Admin", "/admin/users", "UserDirectory.tsx", "Admin"],
      ["Planificación", "/admin/planning", "Planning.tsx", "Admin"],
      ["Proyectos Oficiales", "/admin/projects-list", "OfficialProjectsList.tsx", "Admin"],
      ["Rev. Evaluaciones", "/admin/evaluations", "EvaluationReviews.tsx", "Admin"],
      ["Rev. Actividades", "/admin/task-reviews", "TaskReviews.tsx", "Admin"],
      ["Configuración", "/admin/settings", "Settings.tsx", "Admin"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 7, cellPadding: 2 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Componentes del Dashboard Inteligente", y, "6.1");

  autoTable(doc, {
    startY: y,
    head: [["Componente", "Archivo", "Función"]],
    body: [
      ["WelcomeGreeting", "WelcomeGreeting.tsx", "Saludo personalizado con cita motivacional"],
      ["ProductivityScore", "ProductivityScore.tsx", "Índice de productividad 0-100"],
      ["SmartRecommendations", "SmartRecommendations.tsx", "Recomendaciones personalizadas"],
      ["PriorityTaskQueue", "PriorityTaskQueue.tsx", "Cola de tareas urgentes"],
      ["QuickAccessWidgets", "QuickAccessWidgets.tsx", "Botones de acceso rápido"],
      ["QuickStatsRow", "QuickStatsRow.tsx", "Métricas rápidas"],
      ["GoalTracker", "GoalTracker.tsx", "Sistema de logros/badges"],
      ["UserStatusPanel", "UserStatusPanel.tsx", "Panel de estado del usuario"],
      ["MonthlyProgressChart", "MonthlyProgressChart.tsx", "Gráfico de progreso mensual"],
      ["CompleteProfileBanner", "CompleteProfileBanner.tsx", "Banner de perfil incompleto"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 7, cellPadding: 2 },
  });

  // Section 8: Security
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "SEGURIDAD", y, 7);

  y = addSubsectionTitle(doc, "Autenticación", y, "7.1");

  y = addBulletList(doc, [
    "Sistema de autenticación basado en JWT (JSON Web Tokens)",
    "Tokens de sesión con expiración configurable (1 semana por defecto)",
    "Soporte para recuperación de contraseña por email",
    "Validación de correo electrónico institucional (@unesum.edu.ec)",
    "Contraseñas hasheadas con bcrypt (factor 10)",
  ], y);

  y = addSubsectionTitle(doc, "Autorización (RBAC)", y + 5, "7.2");

  y = addBulletList(doc, [
    "Control de acceso basado en roles (Role-Based Access Control)",
    "Tres niveles de rol: admin, researcher, student",
    "Roles almacenados en tabla separada (user_roles) por seguridad",
    "Función has_role() con SECURITY DEFINER para evitar recursión RLS",
    "Validación de permisos en cliente (ProtectedRoute) y servidor (RLS)",
    "Sincronización automática: Director de Proyecto → rol admin",
  ], y);

  y = addSubsectionTitle(doc, "Row Level Security (RLS)", y + 5, "7.3");

  y = addBulletList(doc, [
    "RLS habilitado en TODAS las tablas con datos sensibles",
    "Políticas separadas para SELECT, INSERT, UPDATE, DELETE",
    "Administradores: acceso completo mediante has_role()",
    "Usuarios: acceso solo a sus propios registros",
    "Tablas públicas: políticas de solo lectura para autenticados",
  ], y);

  y = addSubsectionTitle(doc, "Protección de Datos", y + 5, "7.4");

  y = addBulletList(doc, [
    "Comunicaciones cifradas con HTTPS/TLS 1.3",
    "Certificados SSL automáticos (Let's Encrypt)",
    "Sanitización de inputs mediante React (escape automático)",
    "Prevención de inyección SQL mediante Supabase SDK",
    "Storage buckets con políticas de acceso configuradas",
  ], y);

  y = addInfoBox(
    doc,
    "Cumplimiento",
    "El sistema implementa las mejores prácticas de seguridad siguiendo las recomendaciones de OWASP para aplicaciones web modernas.",
    y,
    "info"
  );

  // Section 9: Storage Buckets
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "ALMACENAMIENTO DE ARCHIVOS", y, 8);

  y = addSubsectionTitle(doc, "Buckets Configurados", y, "8.1");

  autoTable(doc, {
    startY: y,
    head: [["Bucket", "Público", "Contenido", "Límite"]],
    body: [
      ["avatars", "Sí", "Fotos de perfil de usuarios", "5MB"],
      ["cvs", "No", "Currículums vitae en PDF", "10MB"],
      ["institutional-docs", "Sí", "Documentos institucionales del grupo", "20MB"],
      ["news-media", "Sí", "Imágenes de noticias", "10MB"],
      ["evaluation-evidence", "No", "Evidencias de evaluación", "10MB"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Políticas de Storage", y, "8.2");

  y = addBulletList(doc, [
    "Buckets públicos: cualquier usuario autenticado puede ver",
    "Buckets privados: solo el propietario y admins pueden acceder",
    "Subida: usuario autenticado puede subir a su carpeta (user_id/)",
    "CVs: accesibles solo por el propietario y administradores",
    "Evidencias: accesibles por propietario y revisores",
  ], y);

  // Section 10: Edge Functions
  y = addSectionTitle(doc, "EDGE FUNCTIONS", y + 10, 9);

  y = addSubsectionTitle(doc, "Funciones Disponibles", y, "9.1");

  autoTable(doc, {
    startY: y,
    head: [["Función", "Método", "Propósito"]],
    body: [
      ["send-email", "POST", "Enviar correos con Resend (notificaciones, aprobaciones)"],
      ["reject-user", "POST", "Procesar rechazo de usuario y enviar notificación"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Secrets Configurados", y, "9.2");

  y = addBulletList(doc, [
    "SUPABASE_URL: URL del proyecto Supabase",
    "SUPABASE_ANON_KEY: Clave pública anónima",
    "SUPABASE_SERVICE_ROLE_KEY: Clave de servicio (solo edge functions)",
    "RESEND_API_KEY: API key para envío de correos",
  ], y);

  // Section 11: Requirements
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "REQUISITOS TÉCNICOS", y, 10);

  y = addSubsectionTitle(doc, "Requisitos del Cliente", y, "10.1");

  autoTable(doc, {
    startY: y,
    head: [["Componente", "Requisito Mínimo", "Recomendado"]],
    body: [
      ["Navegador", "Chrome 90+, Firefox 88+, Safari 14+, Edge 90+", "Última versión estable"],
      ["JavaScript", "ES2020+, Habilitado", "Habilitado"],
      ["Resolución", "1024 x 768 px", "1920 x 1080 px"],
      ["Conexión", "1 Mbps", "5+ Mbps"],
      ["Cookies", "Habilitadas (para JWT)", "Habilitadas"],
      ["LocalStorage", "Habilitado", "Habilitado"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Compatibilidad de Dispositivos", y, "10.2");

  y = addBulletList(doc, [
    "Computadoras de escritorio (Windows, macOS, Linux)",
    "Laptops y notebooks",
    "Tablets (iPad, Android tablets) - Diseño responsive",
    "Smartphones (iOS, Android) - Sidebar colapsable, diseño mobile-first",
  ], y);

  y = addSubsectionTitle(doc, "Infraestructura del Servidor", y + 5, "10.3");

  y = addParagraph(
    doc,
    "El backend está alojado en Supabase Cloud, que proporciona:",
    y
  );

  y = addBulletList(doc, [
    "Alta disponibilidad (99.9% uptime SLA)",
    "Escalabilidad automática según demanda",
    "Backups automáticos de base de datos (diarios)",
    "CDN global para assets estáticos (Lovable hosting)",
    "Certificados SSL/TLS incluidos y renovación automática",
    "Edge functions con deploy automático",
  ], y);

  // Section 12: Performance
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "RENDIMIENTO Y OPTIMIZACIÓN", y, 11);

  y = addSubsectionTitle(doc, "Métricas de Rendimiento", y, "11.1");

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Objetivo", "Descripción"]],
    body: [
      ["First Contentful Paint", "< 1.5s", "Primer contenido visible"],
      ["Time to Interactive", "< 3.5s", "Tiempo hasta interactividad completa"],
      ["Largest Contentful Paint", "< 2.5s", "Elemento más grande cargado"],
      ["Latencia de API", "< 200ms", "Tiempo de respuesta de consultas"],
      ["Tamaño del bundle", "< 400 KB (gzip)", "JavaScript comprimido"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Optimizaciones Implementadas", y, "11.2");

  y = addBulletList(doc, [
    "Code splitting y lazy loading de rutas con React.lazy()",
    "Caché de consultas con TanStack Query (staleTime configurable)",
    "Compresión de assets estáticos (Brotli/Gzip)",
    "Optimización de imágenes (WebP cuando soportado)",
    "Prefetching de rutas frecuentes",
    "Memoización de componentes costosos (React.memo)",
    "Virtualización de listas largas",
  ], y);

  // Section 13: Versioning
  y = addSectionTitle(doc, "VERSIONADO Y ACTUALIZACIONES", y + 10, 12);

  y = addParagraph(
    doc,
    "El sistema sigue el esquema de versionado semántico (SemVer):",
    y
  );

  y = addBulletList(doc, [
    "MAJOR: Cambios incompatibles en la API o funcionalidad",
    "MINOR: Nueva funcionalidad compatible hacia atrás",
    "PATCH: Corrección de errores compatible hacia atrás",
  ], y);

  y = addSubsectionTitle(doc, "Historial de Versiones", y + 5, "12.1");

  autoTable(doc, {
    startY: y,
    head: [["Versión", "Fecha", "Cambios Principales"]],
    body: [
      ["1.0.0", "Diciembre 2025", "Versión inicial del sistema"],
      ["1.5.0", "Enero 2026", "Dashboard inteligente, recomendaciones, gamificación"],
      ["2.0.0", "Enero 2026", "Índice productividad, cola prioridad, logros, directorio unificado"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Final page - Credits
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "CRÉDITOS Y CONTACTO", y, 13);

  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 78, 121);
  doc.text("Desarrollo:", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Grupo de Investigación GISICF", 20, y);
  y += 6;
  doc.text("Sistemas Inteligentes y Ciberfísicos", 20, y);
  y += 6;
  doc.text("Carrera de Tecnologías de la Información", 20, y);
  y += 6;
  doc.text("Universidad Estatal del Sur de Manabí", 20, y);
  y += 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 78, 121);
  doc.text("Plataforma de Desarrollo:", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Lovable.dev - AI-powered web development", 20, y);
  y += 6;
  doc.text("Supabase - Backend as a Service", 20, y);
  y += 15;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 78, 121);
  doc.text("Contacto Técnico:", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Email: ${CONTACT_EMAIL}`, 20, y);
  y += 6;
  doc.text("URL: https://gisicf.lovable.app", 20, y);
  y += 6;
  doc.text("Dirección: Complejo Deportivo – UNESUM – Km. 1 vía Noboa", 20, y);
  y += 15;

  y = addInfoBox(
    doc,
    "Licencia",
    "Este software es propiedad de la Universidad Estatal del Sur de Manabí. Su uso está restringido a los miembros autorizados del grupo GISICF.",
    y,
    "info"
  );

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawManualPageFooter(doc, i - 1, totalPages - 1);
  }

  // Save PDF
  doc.save("Ficha_Tecnica_GISICF.pdf");
}
