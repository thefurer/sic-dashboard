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
  addInfoBox,
  addScreenshot,
  ManualCoverData,
  CONTACT_EMAIL,
} from "./manualCoverGenerator";

export async function generateTechnicalSheetPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover page
  const coverData: ManualCoverData = {
    title: "FICHA TÉCNICA",
    subtitle: "Especificaciones técnicas y arquitectura del sistema",
    version: "1.0",
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
      ["Versión", "1.0.0"],
      ["Tipo de Aplicación", "Aplicación Web Progresiva (PWA)"],
      ["Propósito", "Gestión integral de actividades de investigación"],
      ["Institución", "Universidad Estatal del Sur de Manabí (UNESUM)"],
      ["Facultad", "Facultad de Ciencias Técnicas"],
      ["Carrera", "Tecnologías de la Información"],
      ["Grupo de Investigación", "GISICF"],
      ["Fecha de Desarrollo", new Date().getFullYear().toString()],
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
    "GISICF es una plataforma web desarrollada para automatizar y optimizar la gestión de las actividades de investigación del Grupo de Investigación en Sistemas de Información, Ciencias de la Computación y Formación. El sistema permite el registro, seguimiento y evaluación de la producción científica de los investigadores.",
    y
  );

  y = addSubsectionTitle(doc, "Funcionalidades Principales", y + 5, "2.1");

  y = addBulletList(doc, [
    "Gestión de proyectos de investigación",
    "Registro de producción científica (artículos, libros)",
    "Sistema de evaluación anual de investigadores",
    "Planificación de actividades y asignación de tareas",
    "Gestión de impactos y vinculación con la sociedad",
    "Panel de administración y gestión de usuarios",
    "Generación automática de reportes PDF",
    "Sistema de notificaciones en tiempo real",
  ], y);

  // Section 3: Technical Architecture
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "ARQUITECTURA TECNOLÓGICA", y, 3);

  y = addSubsectionTitle(doc, "Stack Tecnológico", y, "3.1");

  autoTable(doc, {
    startY: y,
    head: [["Capa", "Tecnología", "Versión", "Propósito"]],
    body: [
      ["Frontend", "React", "18.x", "Biblioteca UI principal"],
      ["Frontend", "TypeScript", "5.x", "Tipado estático"],
      ["Frontend", "Vite", "5.x", "Bundler y dev server"],
      ["Frontend", "Tailwind CSS", "3.x", "Framework de estilos"],
      ["Frontend", "shadcn/ui", "Latest", "Componentes UI"],
      ["Frontend", "TanStack Query", "5.x", "Gestión de estado servidor"],
      ["Frontend", "React Router", "6.x", "Enrutamiento"],
      ["Backend", "Supabase", "Latest", "Backend as a Service"],
      ["Base de Datos", "PostgreSQL", "15.x", "Base de datos relacional"],
      ["Autenticación", "Supabase Auth", "Latest", "Sistema de autenticación"],
      ["Almacenamiento", "Supabase Storage", "Latest", "Almacenamiento de archivos"],
      ["PDF", "jsPDF", "3.x", "Generación de documentos PDF"],
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

  y = addSubsectionTitle(doc, "Arquitectura de la Aplicación", y, "3.2");

  y = addParagraph(
    doc,
    "La aplicación sigue una arquitectura de Single Page Application (SPA) con separación clara entre frontend y backend. El frontend se comunica con Supabase a través de su SDK oficial, utilizando Row Level Security (RLS) para control de acceso a datos.",
    y
  );

  // Diagram representation in text
  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  
  const diagram = [
    "┌─────────────────────────────────────────────────────────────┐",
    "│                        CLIENTE (Browser)                   │",
    "│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │",
    "│  │   React     │ │  TanStack   │ │    React Router     │   │",
    "│  │ Components  │ │   Query     │ │     Navigation      │   │",
    "│  └─────────────┘ └─────────────┘ └─────────────────────┘   │",
    "└─────────────────────────┬───────────────────────────────────┘",
    "                          │ HTTPS/WSS",
    "┌─────────────────────────▼───────────────────────────────────┐",
    "│                      SUPABASE CLOUD                         │",
    "│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │",
    "│  │    Auth     │ │  Database   │ │      Storage        │   │",
    "│  │  (JWT/RLS)  │ │ (PostgreSQL)│ │   (File Buckets)    │   │",
    "│  └─────────────┘ └─────────────┘ └─────────────────────┘   │",
    "└─────────────────────────────────────────────────────────────┘",
  ];

  diagram.forEach((line) => {
    doc.text(line, 20, y);
    y += 4;
  });

  doc.setFont("helvetica", "normal");

  // Section 4: System Modules
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "MÓDULOS DEL SISTEMA", y, 4);

  autoTable(doc, {
    startY: y,
    head: [["Módulo", "Descripción", "Usuarios"]],
    body: [
      ["Dashboard", "Panel principal con métricas y estadísticas", "Todos"],
      ["Proyectos", "Gestión de proyectos de investigación", "Investigadores"],
      ["Producción Científica", "Registro de artículos y libros", "Investigadores"],
      ["Evaluación", "Evaluación anual con evidencias", "Investigadores"],
      ["Mis Tareas", "Tareas asignadas según planificación", "Todos"],
      ["Impactos", "Registro de impactos de investigación", "Investigadores"],
      ["Vinculación", "Actividades de vinculación social", "Investigadores"],
      ["Institucional", "Información y documentos del grupo", "Todos"],
      ["Perfil", "Gestión de cuenta personal", "Todos"],
      ["Admin - Usuarios", "Gestión de usuarios del sistema", "Administradores"],
      ["Admin - Evaluaciones", "Revisión de evaluaciones", "Administradores"],
      ["Admin - Tareas", "Revisión de evidencias de tareas", "Administradores"],
      ["Admin - Planificación", "Creación de planes de trabajo", "Administradores"],
      ["Admin - Configuración", "Parámetros del sistema", "Administradores"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  y = addSectionTitle(doc, "MODELO DE DATOS", y, 5);

  y = addParagraph(
    doc,
    "El sistema utiliza PostgreSQL como base de datos relacional. Las principales entidades del modelo de datos son:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Tabla", "Descripción", "Relaciones Principales"]],
    body: [
      ["profiles", "Información de usuarios", "user_roles, projects"],
      ["user_roles", "Roles de usuarios (admin, researcher, student)", "profiles"],
      ["projects", "Proyectos de investigación", "profiles, project_investigators"],
      ["evaluation_reports", "Informes de evaluación anual", "profiles, evaluation_items"],
      ["evaluation_items", "Indicadores de evaluación", "evaluation_reports"],
      ["planning_sheets", "Planes de trabajo", "planning_activities, planning_members"],
      ["planning_activities", "Actividades planificadas", "planning_sheets, assigned_tasks"],
      ["assigned_tasks", "Tareas asignadas a usuarios", "planning_activities, profiles"],
      ["news_posts", "Noticias y comunicados", "-"],
      ["app_settings", "Configuración del sistema", "-"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  // Section 6: Security
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "SEGURIDAD", y, 6);

  y = addSubsectionTitle(doc, "Autenticación", y, "6.1");

  y = addBulletList(doc, [
    "Sistema de autenticación basado en JWT (JSON Web Tokens)",
    "Tokens de sesión con expiración configurable",
    "Soporte para recuperación de contraseña por email",
    "Validación de correo electrónico institucional",
  ], y);

  y = addSubsectionTitle(doc, "Autorización", y + 5, "6.2");

  y = addBulletList(doc, [
    "Control de acceso basado en roles (RBAC)",
    "Tres niveles de rol: Administrador, Investigador, Estudiante",
    "Row Level Security (RLS) en todas las tablas críticas",
    "Validación de permisos tanto en cliente como en servidor",
  ], y);

  y = addSubsectionTitle(doc, "Protección de Datos", y + 5, "6.3");

  y = addBulletList(doc, [
    "Todas las comunicaciones cifradas con HTTPS/TLS",
    "Contraseñas hasheadas con algoritmos seguros (bcrypt)",
    "Sanitización de inputs para prevenir inyección SQL",
    "Protección contra XSS mediante React (escape automático)",
  ], y);

  y = addInfoBox(
    doc,
    "Cumplimiento",
    "El sistema implementa buenas prácticas de seguridad siguiendo las recomendaciones de OWASP para aplicaciones web.",
    y,
    "info"
  );

  // Section 7: Requirements
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "REQUISITOS TÉCNICOS", y, 7);

  y = addSubsectionTitle(doc, "Requisitos del Cliente", y, "7.1");

  autoTable(doc, {
    startY: y,
    head: [["Componente", "Requisito Mínimo", "Recomendado"]],
    body: [
      ["Navegador", "Chrome 90+, Firefox 88+, Safari 14+, Edge 90+", "Última versión estable"],
      ["JavaScript", "Habilitado", "Habilitado"],
      ["Resolución", "1024 x 768 px", "1920 x 1080 px"],
      ["Conexión", "1 Mbps", "5+ Mbps"],
      ["Cookies", "Habilitadas", "Habilitadas"],
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

  y = addSubsectionTitle(doc, "Compatibilidad de Dispositivos", y, "7.2");

  y = addBulletList(doc, [
    "Computadoras de escritorio (Windows, macOS, Linux)",
    "Laptops y notebooks",
    "Tablets (iPad, Android tablets)",
    "Smartphones (iOS, Android) - Versión responsive",
  ], y);

  y = addSubsectionTitle(doc, "Infraestructura del Servidor", y + 5, "7.3");

  y = addParagraph(
    doc,
    "El backend está alojado en Supabase Cloud, que proporciona:",
    y
  );

  y = addBulletList(doc, [
    "Alta disponibilidad (99.9% uptime SLA)",
    "Escalabilidad automática según demanda",
    "Backups automáticos de base de datos",
    "CDN global para assets estáticos",
    "Certificados SSL/TLS incluidos",
  ], y);

  // Section 8: Performance
  doc.addPage();
  y = drawManualPageHeader(doc, "FICHA TÉCNICA - GISICF");

  y = addSectionTitle(doc, "RENDIMIENTO Y ESCALABILIDAD", y, 8);

  y = addSubsectionTitle(doc, "Métricas de Rendimiento", y, "8.1");

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Objetivo", "Descripción"]],
    body: [
      ["Tiempo de carga inicial", "< 3 segundos", "Primera carga de la aplicación"],
      ["Time to Interactive", "< 5 segundos", "Tiempo hasta interactividad completa"],
      ["Latencia de API", "< 200 ms", "Tiempo de respuesta de consultas"],
      ["Tamaño del bundle", "< 500 KB (gzip)", "Código JavaScript comprimido"],
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

  y = addSubsectionTitle(doc, "Optimizaciones Implementadas", y, "8.2");

  y = addBulletList(doc, [
    "Code splitting y lazy loading de componentes",
    "Caché de consultas con TanStack Query",
    "Compresión de assets estáticos",
    "Optimización de imágenes",
    "Prefetching de rutas frecuentes",
  ], y);

  // Section 9: Versioning
  y = addSectionTitle(doc, "VERSIONADO Y ACTUALIZACIONES", y + 10, 9);

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

  y = addSubsectionTitle(doc, "Historial de Versiones", y + 5, "9.1");

  autoTable(doc, {
    startY: y,
    head: [["Versión", "Fecha", "Cambios Principales"]],
    body: [
      ["1.0.0", "Diciembre 2025", "Versión inicial del sistema"],
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

  y = addSectionTitle(doc, "CRÉDITOS Y CONTACTO", y, 10);

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
  doc.text("Carrera de Tecnologías de la Información", 20, y);
  y += 6;
  doc.text("Universidad Estatal del Sur de Manabí", 20, y);
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
