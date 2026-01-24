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
  addScreenshot,
  ManualCoverData,
  CONTACT_EMAIL,
} from "./manualCoverGenerator";

// Screenshot paths
const SCREENSHOTS = {
  dashboard: "/manual-screenshots/dashboard.png",
  infoGeneral: "/manual-screenshots/info-general.png",
  perfil: "/manual-screenshots/perfil.png",
};

export async function generateUserManualPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover page
  const coverData: ManualCoverData = {
    title: "MANUAL DE USUARIO",
    subtitle: "Guía completa para investigadores y estudiantes",
    version: "2.0",
    date: new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long" }),
    documentType: "manual_usuario",
  };

  await drawManualCover(doc, coverData);

  // Table of Contents
  doc.addPage();
  let y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(31, 78, 121);
  doc.text("ÍNDICE DE CONTENIDOS", pageWidth / 2, y, { align: "center" });
  y += 15;

  const tocItems = [
    { section: "1", title: "Introducción a la Plataforma GISICF", page: 3 },
    { section: "2", title: "Acceso al Sistema", page: 4 },
    { section: "3", title: "Panel de Control Inteligente (Dashboard)", page: 5 },
    { section: "4", title: "Proyectos Oficiales", page: 8 },
    { section: "5", title: "Evaluación Anual", page: 9 },
    { section: "6", title: "Mis Tareas y Actividades", page: 11 },
    { section: "7", title: "Directorio de Investigadores", page: 13 },
    { section: "8", title: "Información Institucional (GISICF)", page: 14 },
    { section: "9", title: "Perfil de Usuario", page: 15 },
    { section: "10", title: "Preguntas Frecuentes", page: 17 },
  ];

  autoTable(doc, {
    startY: y,
    head: [["Sección", "Título", "Página"]],
    body: tocItems.map((item) => [item.section, item.title, item.page.toString()]),
    theme: "plain",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: 130 },
      2: { cellWidth: 25, halign: "center" },
    },
  });

  // Section 1: Introduction
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "INTRODUCCIÓN A LA PLATAFORMA GISICF", y, 1);

  y = addParagraph(
    doc,
    "La plataforma GISICF (Gestión de Investigación Científica y Formativa) es un sistema integral diseñado para facilitar la gestión, seguimiento y evaluación de las actividades de investigación del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos de la Universidad Estatal del Sur de Manabí.",
    y
  );

  y = addSubsectionTitle(doc, "Objetivos del Sistema", y + 5, "1.1");

  y = addBulletList(doc, [
    "Centralizar la información de proyectos de investigación oficiales",
    "Facilitar el registro y seguimiento de la producción científica",
    "Automatizar el proceso de evaluación anual de investigadores",
    "Gestionar las actividades planificadas y tareas asignadas",
    "Proporcionar un dashboard inteligente con recomendaciones personalizadas",
    "Generar reportes e informes institucionales en formato PDF",
    "Mantener un directorio actualizado de investigadores",
  ], y);

  y = addSubsectionTitle(doc, "Usuarios del Sistema", y + 5, "1.2");

  y = addParagraph(
    doc,
    "La plataforma está diseñada para tres tipos de usuarios principales:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Rol", "Descripción", "Acceso"]],
    body: [
      ["Investigador", "Docente investigador del grupo GISICF", "Completo a funciones de usuario"],
      ["Estudiante", "Estudiante vinculado a proyectos de investigación", "Limitado según asignación"],
      ["Administrador", "Coordinador/Director del grupo de investigación", "Completo, incluye gestión"],
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

  y = addInfoBox(
    doc,
    "Importante",
    "Todos los usuarios deben ser aprobados por un administrador antes de poder acceder a las funcionalidades completas del sistema.",
    y,
    "warning"
  );

  // Section 2: Access
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "ACCESO AL SISTEMA", y, 2);

  y = addSubsectionTitle(doc, "Registro de Nuevo Usuario", y, "2.1");

  y = addNumberedList(doc, [
    "Ingrese a la página principal de la plataforma GISICF (gisicf.com)",
    "Haga clic en el botón 'Registrarse' ubicado en la pantalla de inicio",
    "Complete el formulario con sus datos: nombre completo y código de investigador",
    "Ingrese un correo electrónico institucional válido (@unesum.edu.ec)",
    "Cree una contraseña segura (mínimo 8 caracteres, incluir mayúsculas y números)",
    "Proporcione su número de teléfono de contacto",
    "Haga clic en 'Crear Cuenta'",
    "Espere la aprobación del administrador para acceder al sistema",
  ], y);

  y = addInfoBox(
    doc,
    "Nota",
    "El administrador recibirá una notificación de su registro y procederá a aprobar su cuenta. Este proceso puede tomar hasta 24-48 horas hábiles.",
    y,
    "info"
  );

  y = addSubsectionTitle(doc, "Inicio de Sesión", y + 5, "2.2");

  y = addNumberedList(doc, [
    "Ingrese a la plataforma GISICF",
    "En la pantalla de inicio de sesión, ingrese su correo electrónico",
    "Ingrese su contraseña",
    "Haga clic en 'Iniciar Sesión'",
  ], y);

  y = addSubsectionTitle(doc, "Recuperación de Contraseña", y + 5, "2.3");

  y = addParagraph(
    doc,
    "Si olvidó su contraseña, siga estos pasos:",
    y
  );

  y = addNumberedList(doc, [
    "En la pantalla de inicio de sesión, haga clic en '¿Olvidaste tu contraseña?'",
    "Ingrese su correo electrónico registrado",
    "Recibirá un enlace para restablecer su contraseña",
    "Siga las instrucciones del correo para crear una nueva contraseña",
  ], y);

  // Section 3: Dashboard
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "PANEL DE CONTROL INTELIGENTE (DASHBOARD)", y, 3);

  y = addParagraph(
    doc,
    "El Dashboard es la pantalla principal que se muestra al iniciar sesión. Proporciona un resumen visual de las métricas más importantes, recomendaciones personalizadas y acceso rápido a las principales funcionalidades.",
    y
  );

  // Add dashboard screenshot
  y = await addScreenshot(doc, SCREENSHOTS.dashboard, y + 5, "Figura 3.1: Vista del Dashboard principal inteligente");

  y = addSubsectionTitle(doc, "Componentes del Dashboard Inteligente", y + 5, "3.1");

  autoTable(doc, {
    startY: y,
    head: [["Componente", "Descripción"]],
    body: [
      ["Saludo personalizado", "Muestra un saludo con su nombre y una cita motivacional diaria"],
      ["Índice de Productividad", "Puntuación de 0-100 basada en tareas, evaluación y perfil"],
      ["Recomendaciones Inteligentes", "Sugerencias priorizadas de acciones a realizar"],
      ["Cola de Prioridad", "Lista de tareas urgentes ordenadas por prioridad"],
      ["Accesos Rápidos", "Botones de navegación a funciones principales"],
      ["Estadísticas Rápidas", "Métricas de tareas, evaluación y actividad"],
      ["Noticias y Novedades", "Carrusel con las últimas noticias del grupo"],
      ["Panel de Estado", "Resumen de su estado actual en el sistema"],
      ["Logros (Gamificación)", "Badges desbloqueables por cumplir objetivos"],
      ["Gráfico de Progreso", "Evolución mensual de evaluaciones y tareas"],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSubsectionTitle(doc, "Sistema de Recomendaciones Inteligentes", y, "3.2");

  y = addParagraph(
    doc,
    "El sistema analiza su actividad y genera recomendaciones personalizadas con niveles de prioridad:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Prioridad", "Color", "Ejemplos de Recomendaciones"]],
    body: [
      ["Alta", "Rojo", "Tareas vencidas, evaluación con observaciones, actividades urgentes"],
      ["Media", "Amarillo", "Perfil incompleto, producción científica pendiente, tareas próximas"],
      ["Baja", "Verde", "Sugerencias de mejora, recordatorios informativos"],
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

  y = addSubsectionTitle(doc, "Índice de Productividad", y, "3.3");

  y = addParagraph(
    doc,
    "El índice de productividad es una puntuación de 0 a 100 que refleja su desempeño:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Criterio", "Puntos Máximos"]],
    body: [
      ["Tareas completadas a tiempo", "20 pts"],
      ["Evaluación enviada/aprobada", "25 pts"],
      ["Perfil completo", "10 pts"],
      ["Sin tareas vencidas", "15 pts"],
      ["Producción científica registrada", "30 pts"],
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

  y = addSubsectionTitle(doc, "Sistema de Logros (Gamificación)", y, "3.4");

  y = addBulletList(doc, [
    "Primera Evaluación: Enviar tu primera evaluación anual",
    "Puntual: Completar 5 tareas antes de la fecha límite",
    "Perfil Completo: Llenar todos los campos del perfil incluyendo ORCID",
    "Publicador: Registrar tu primera publicación científica",
    "Colaborador: Participar en un proyecto grupal",
    "Comprometido: Mantener actividad constante durante 3 meses",
  ], y);

  y = addSubsectionTitle(doc, "Navegación Principal", y + 5, "3.5");

  autoTable(doc, {
    startY: y,
    head: [["Sección", "Descripción"]],
    body: [
      ["Dashboard", "Vista general con métricas inteligentes y recomendaciones"],
      ["Información GISICF", "Misión, visión, líneas de investigación y documentos"],
      ["Evaluación", "Evaluación anual del investigador por categorías"],
      ["Mis Tareas", "Actividades asignadas según planificación estratégica"],
      ["Proyectos", "Proyectos oficiales del grupo de investigación"],
      ["Investigadores", "Directorio de miembros del grupo con perfiles"],
      ["Perfil", "Configuración de cuenta personal y CV"],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 4: Projects
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "PROYECTOS OFICIALES", y, 4);

  y = addParagraph(
    doc,
    "Esta sección muestra los proyectos de investigación oficiales del grupo GISICF. Los proyectos son registrados por los administradores y aparecen disponibles para vincular en las evaluaciones.",
    y
  );

  y = addSubsectionTitle(doc, "Visualización de Proyectos", y + 5, "4.1");

  y = addBulletList(doc, [
    "Lista de proyectos ordenados por año",
    "Nombre y descripción del proyecto",
    "Documentación asociada (cuando disponible)",
    "Estado actual del proyecto",
  ], y);

  y = addSubsectionTitle(doc, "Vinculación con Evaluación", y + 5, "4.2");

  y = addParagraph(
    doc,
    "Al registrar indicadores en su evaluación anual que involucren proyectos de investigación, podrá seleccionar de la lista de proyectos oficiales para vincular sus actividades.",
    y
  );

  y = addInfoBox(
    doc,
    "Nota",
    "Solo los administradores pueden crear, editar o eliminar proyectos oficiales. Si necesita agregar un proyecto, contacte al coordinador del grupo.",
    y,
    "info"
  );

  // Section 5: Evaluation
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "EVALUACIÓN ANUAL", y, 5);

  y = addParagraph(
    doc,
    "La evaluación anual es un proceso fundamental para medir el desempeño investigativo de cada miembro del grupo GISICF. El sistema permite registrar evidencias en diferentes categorías con un sistema de pasos guiados.",
    y
  );

  y = addSubsectionTitle(doc, "Categorías de Evaluación", y + 5, "5.1");

  autoTable(doc, {
    startY: y,
    head: [["Categoría", "Peso", "Indicadores Incluidos"]],
    body: [
      ["A - Publicación Científica", "45 pts", "Artículos indexados, libros, capítulos, ponencias"],
      ["B - Transferencia de Tecnología", "10 pts", "Patentes, convocatorias, formación de investigadores"],
      ["C - Recursos Económicos", "15 pts", "Gestión de recursos, financiamiento obtenido"],
      ["D - Impactos", "30 pts", "Sociales, ambientales, tecnológicos, económicos"],
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

  y = addSubsectionTitle(doc, "Proceso de Evaluación (Wizard de 5 Pasos)", y, "5.2");

  y = addNumberedList(doc, [
    "Paso 1 - Publicaciones: Registre artículos, libros, capítulos y ponencias con DOI/ISBN",
    "Paso 2 - Transferencia: Agregue patentes, convocatorias y actividades de formación",
    "Paso 3 - Recursos: Documente la gestión de recursos económicos para investigación",
    "Paso 4 - Impactos: Registre los impactos generados por su investigación",
    "Paso 5 - Revisión: Verifique el resumen y envíe para aprobación del administrador",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSubsectionTitle(doc, "Registro de Artículos con DOI", y, "5.3");

  y = addParagraph(
    doc,
    "El sistema obtiene automáticamente los metadatos del artículo al ingresar el DOI:",
    y
  );

  y = addNumberedList(doc, [
    "En la sección de Publicaciones, haga clic en 'Agregar Artículo'",
    "Ingrese el DOI del artículo (ej: 10.1000/xyz123)",
    "El sistema buscará automáticamente: título, autores, revista, año",
    "Seleccione la base indexada (Scopus/WOS o Latindex/Scielo)",
    "Suba la evidencia (PDF del artículo o captura de la base)",
    "Vincule el proyecto oficial relacionado (si aplica)",
    "Guarde el registro",
  ], y);

  y = addSubsectionTitle(doc, "Estados de la Evaluación", y + 5, "5.4");

  autoTable(doc, {
    startY: y,
    head: [["Estado", "Descripción", "Acción"]],
    body: [
      ["Borrador", "Evaluación en progreso", "Continuar completando"],
      ["Enviada", "Esperando revisión del administrador", "Esperar aprobación"],
      ["Observada", "El administrador solicita correcciones", "Corregir y reenviar"],
      ["Aprobada", "Evaluación aceptada oficialmente", "Descargar PDF"],
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

  y = addInfoBox(
    doc,
    "Importante",
    "Una vez enviada la evaluación, no podrá realizar modificaciones a menos que el administrador devuelva la evaluación para correcciones. Si necesita editar después de enviar, deberá proporcionar una justificación.",
    y,
    "warning"
  );

  // Section 6: Tasks
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "MIS TAREAS Y ACTIVIDADES", y, 6);

  y = addParagraph(
    doc,
    "La sección 'Mis Tareas' muestra todas las actividades asignadas según la planificación estratégica del grupo. Incluye información del plan general, equipo de trabajo y tareas individuales.",
    y
  );

  y = addSubsectionTitle(doc, "Estructura de la Página", y + 5, "6.1");

  y = addBulletList(doc, [
    "Datos Generales del Plan: Período, presidente, enlace de Drive, cronograma de reuniones",
    "Equipo de Trabajo: Lista de miembros del plan con sus roles",
    "Mis Actividades Asignadas: Tareas individuales con fechas y estados",
  ], y);

  y = addSubsectionTitle(doc, "Estados de las Tareas", y + 5, "6.2");

  autoTable(doc, {
    startY: y,
    head: [["Estado", "Color", "Descripción", "Acción Requerida"]],
    body: [
      ["Pendiente", "Gris", "Tarea asignada sin completar", "Subir evidencia"],
      ["Enviada", "Azul", "Evidencia subida, esperando revisión", "Esperar"],
      ["Aprobada", "Verde", "Evidencia aceptada por el administrador", "Ninguna"],
      ["Observada", "Amarillo", "Requiere correcciones", "Ver observaciones y corregir"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addSubsectionTitle(doc, "Subir Evidencia de una Tarea", y, "6.3");

  y = addNumberedList(doc, [
    "Localice la tarea en su lista de actividades",
    "Haga clic en el botón 'Subir Evidencia'",
    "En el modal, agregue una descripción clara de la evidencia",
    "Suba el archivo de respaldo (PDF, imagen, documento)",
    "Opcionalmente agregue un enlace externo (Drive, repositorio, etc.)",
    "Haga clic en 'Enviar Evidencia'",
    "La tarea pasará a estado 'Enviada' y esperará revisión",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSubsectionTitle(doc, "Retirar Envío", y, "6.4");

  y = addParagraph(
    doc,
    "Si necesita modificar una evidencia ya enviada antes de que sea revisada, puede retirar el envío:",
    y
  );

  y = addNumberedList(doc, [
    "Localice la tarea con estado 'Enviada'",
    "Haga clic en 'Retirar Envío'",
    "La tarea volverá a estado 'Pendiente'",
    "Modifique la evidencia y vuelva a enviar",
  ], y);

  y = addSubsectionTitle(doc, "Cola de Prioridad en Dashboard", y + 5, "6.5");

  y = addParagraph(
    doc,
    "El Dashboard muestra las tareas más urgentes ordenadas por algoritmo de prioridad:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Prioridad", "Criterio"]],
    body: [
      ["1 - Vencidas", "Tareas cuya fecha límite ya pasó"],
      ["2 - Observadas", "Tareas devueltas con observaciones del administrador"],
      ["3 - Vencen Hoy", "Tareas con fecha límite hoy"],
      ["4 - Urgentes", "Tareas que vencen en los próximos 3 días"],
      ["5 - Próximas", "Tareas con fecha límite cercana"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 7: Researcher Directory
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "DIRECTORIO DE INVESTIGADORES", y, 7);

  y = addParagraph(
    doc,
    "El directorio muestra todos los investigadores activos del grupo GISICF con su información de contacto y perfil académico.",
    y
  );

  y = addSubsectionTitle(doc, "Información Visible", y + 5, "7.1");

  y = addBulletList(doc, [
    "Nombre completo con foto de perfil",
    "País de origen (bandera de Ecuador o Colombia)",
    "Código de investigador",
    "Rol en investigación (Director, Investigador Principal, Investigador, etc.)",
    "ORCID (identificador único de investigador)",
    "Correo electrónico institucional",
    "Opción de descargar CV (cuando disponible)",
  ], y);

  y = addSubsectionTitle(doc, "Búsqueda y Filtros", y + 5, "7.2");

  y = addBulletList(doc, [
    "Buscar por nombre o código de investigador",
    "Filtrar por rol de investigación",
    "Ordenar alfabéticamente o por fecha de registro",
  ], y);

  // Section 8: Institutional
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "INFORMACIÓN INSTITUCIONAL (GISICF)", y, 8);

  y = addParagraph(
    doc,
    "Esta sección contiene toda la información oficial del Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos.",
    y
  );

  // Add institutional info screenshot
  y = await addScreenshot(doc, SCREENSHOTS.infoGeneral, y + 5, "Figura 8.1: Información General del Grupo GISICF");

  y = addSubsectionTitle(doc, "Contenido Disponible", y + 5, "8.1");

  y = addBulletList(doc, [
    "Misión: Propósito fundamental del grupo de investigación",
    "Visión: Proyección futura y metas a largo plazo",
    "Objetivos: Metas específicas de investigación del grupo",
    "Líneas de Investigación: Áreas temáticas en las que trabaja el grupo",
  ], y);

  y = addSubsectionTitle(doc, "Documentos Descargables", y + 5, "8.2");

  autoTable(doc, {
    startY: y,
    head: [["Documento", "Descripción"]],
    body: [
      ["Registro de Grupo", "Documento oficial de registro del grupo GISICF"],
      ["Instructivo", "Guía de procedimientos y normativas del grupo"],
      ["Plan de Trabajo", "Planificación anual de actividades"],
      ["Planificación Estratégica", "Documento de planificación estratégica vigente"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 9: Profile
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "PERFIL DE USUARIO", y, 9);

  y = addParagraph(
    doc,
    "En la sección de Perfil puede gestionar su información personal, actualizar su fotografía, validar su ORCID y administrar su currículum vitae.",
    y
  );

  // Add profile screenshot
  y = await addScreenshot(doc, SCREENSHOTS.perfil, y + 5, "Figura 9.1: Vista del perfil de usuario");

  y = addSubsectionTitle(doc, "Información Personal Requerida", y + 5, "9.1");

  y = addBulletList(doc, [
    "Nombre completo (obligatorio)",
    "Correo electrónico institucional (obligatorio)",
    "Teléfono de contacto con código de país",
    "País de origen (Ecuador o Colombia)",
    "Código de investigador",
    "ORCID (se valida en tiempo real con la API de ORCID)",
    "Rol en investigación (Director, Investigador Principal, etc.)",
    "Biografía profesional",
    "Currículum Vitae en PDF",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSubsectionTitle(doc, "Validación de ORCID", y, "9.2");

  y = addParagraph(
    doc,
    "El sistema valida su ORCID en tiempo real conectándose a la API oficial de ORCID:",
    y
  );

  y = addNumberedList(doc, [
    "Ingrese su ORCID en el formato XXXX-XXXX-XXXX-XXXX",
    "El sistema verificará que el ORCID existe y es válido",
    "Si es válido, aparecerá un check verde",
    "Si es inválido, aparecerá un mensaje de error",
  ], y);

  y = addSubsectionTitle(doc, "Actualizar Foto de Perfil", y + 5, "9.3");

  y = addNumberedList(doc, [
    "Haga clic en su avatar actual",
    "Seleccione una imagen de su dispositivo",
    "La imagen se recortará automáticamente en formato cuadrado",
    "La foto se actualizará en todo el sistema",
  ], y);

  y = addSubsectionTitle(doc, "Subir Currículum Vitae", y + 5, "9.4");

  y = addNumberedList(doc, [
    "En la sección de CV, haga clic en 'Subir CV'",
    "Seleccione un archivo PDF (máximo 10MB)",
    "El CV quedará disponible para descarga en el directorio",
    "Puede actualizarlo en cualquier momento",
  ], y);

  y = addInfoBox(
    doc,
    "Banner de Perfil Incompleto",
    "Si su perfil tiene campos importantes vacíos (ORCID, país, teléfono, CV), verá un banner en el Dashboard indicando que debe completar su información para aparecer correctamente en el directorio.",
    y,
    "info"
  );

  // Section 10: FAQ
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "PREGUNTAS FRECUENTES", y, 10);

  const faqs = [
    {
      q: "¿Cómo puedo recuperar mi contraseña?",
      a: "En la pantalla de inicio de sesión, haga clic en '¿Olvidaste tu contraseña?' e ingrese su correo electrónico para recibir un enlace de recuperación.",
    },
    {
      q: "¿Cuánto tiempo tarda la aprobación de mi cuenta?",
      a: "El proceso de aprobación puede tomar entre 24 y 48 horas hábiles. Recibirá un correo de notificación cuando su cuenta esté activa.",
    },
    {
      q: "¿Puedo editar mi evaluación después de enviarla?",
      a: "No directamente. Si necesita hacer correcciones, debe esperar a que el administrador devuelva su evaluación o proporcionar una justificación para editar.",
    },
    {
      q: "¿Qué formatos de archivo puedo subir como evidencia?",
      a: "Se aceptan archivos PDF, imágenes (JPG, PNG), y documentos de Office. El tamaño máximo por archivo es de 10MB.",
    },
    {
      q: "¿Por qué mi índice de productividad es bajo?",
      a: "El índice considera: tareas a tiempo (20pts), evaluación enviada (25pts), perfil completo (10pts), sin tareas vencidas (15pts), y producción científica (30pts). Revise qué criterios puede mejorar.",
    },
    {
      q: "¿Cómo obtengo los badges/logros?",
      a: "Los logros se desbloquean automáticamente al cumplir ciertos hitos: primera evaluación, tareas a tiempo, perfil completo, primera publicación, etc.",
    },
    {
      q: "¿Cómo valido mi ORCID?",
      a: "En su perfil, ingrese su ORCID en el formato correcto. El sistema se conectará a la API de ORCID y validará que existe y es correcto.",
    },
  ];

  faqs.forEach((faq, index) => {
    if (y > 250) {
      doc.addPage();
      y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");
      y += 10;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 78, 121);
    doc.text(`${index + 1}. ${faq.q}`, 20, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(faq.a, pageWidth - 50);
    lines.forEach((line: string) => {
      doc.text(line, 25, y);
      y += 5;
    });
    y += 8;
  });

  // Contact page
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "SOPORTE Y CONTACTO", y);

  y = addParagraph(
    doc,
    "Para soporte técnico o consultas sobre el uso de la plataforma GISICF, puede contactar a:",
    y
  );

  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 78, 121);
  doc.text("Grupo de Investigación GISICF", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Universidad Estatal del Sur de Manabí", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("Facultad de Ciencias Técnicas", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("Carrera de Tecnologías de la Información", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 78, 121);
  doc.text(`Email: ${CONTACT_EMAIL}`, pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("URL: https://gisicf.lovable.app", pageWidth / 2, y, { align: "center" });

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawManualPageFooter(doc, i - 1, totalPages - 1);
  }

  // Save PDF
  doc.save("Manual_Usuario_GISICF.pdf");
}
