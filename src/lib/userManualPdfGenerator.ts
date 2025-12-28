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
    version: "1.0",
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
    { section: "3", title: "Panel de Control (Dashboard)", page: 5 },
    { section: "4", title: "Gestión de Proyectos", page: 7 },
    { section: "5", title: "Producción Científica", page: 8 },
    { section: "6", title: "Evaluación Anual", page: 9 },
    { section: "7", title: "Mis Tareas", page: 11 },
    { section: "8", title: "Impactos y Vinculación", page: 12 },
    { section: "9", title: "Perfil de Usuario", page: 13 },
    { section: "10", title: "Preguntas Frecuentes", page: 15 },
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
    "La plataforma GISICF (Gestión de Investigación Científica y Formativa) es un sistema integral diseñado para facilitar la gestión, seguimiento y evaluación de las actividades de investigación del Grupo de Investigación en Sistemas de Información, Ciencias de la Computación y Formación de la Universidad Estatal del Sur de Manabí.",
    y
  );

  y = addSubsectionTitle(doc, "Objetivos del Sistema", y + 5, "1.1");

  y = addBulletList(doc, [
    "Centralizar la información de proyectos de investigación",
    "Facilitar el registro y seguimiento de la producción científica",
    "Automatizar el proceso de evaluación anual de investigadores",
    "Gestionar las actividades planificadas y tareas asignadas",
    "Generar reportes e informes institucionales",
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
      ["Administrador", "Coordinador del grupo de investigación", "Completo, incluye gestión"],
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
    "Ingrese a la página principal de la plataforma GISICF",
    "Haga clic en el botón 'Registrarse' ubicado en la pantalla de inicio",
    "Complete el formulario de registro con sus datos personales",
    "Ingrese un correo electrónico institucional válido",
    "Cree una contraseña segura (mínimo 8 caracteres)",
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

  y = addSectionTitle(doc, "PANEL DE CONTROL (DASHBOARD)", y, 3);

  y = addParagraph(
    doc,
    "El Dashboard es la pantalla principal que se muestra al iniciar sesión. Proporciona un resumen visual de las métricas más importantes y acceso rápido a las principales funcionalidades.",
    y
  );

  // Add dashboard screenshot
  y = await addScreenshot(doc, SCREENSHOTS.dashboard, y + 5, "Figura 3.1: Vista del Dashboard principal");

  y = addSubsectionTitle(doc, "Elementos del Dashboard", y + 5, "3.1");

  y = addBulletList(doc, [
    "Tarjetas de métricas: Muestran estadísticas clave como proyectos activos, publicaciones, tareas pendientes",
    "Noticias recientes: Últimas novedades y comunicados del grupo",
    "Menú lateral: Navegación a todas las secciones del sistema",
    "Barra superior: Acceso al perfil, notificaciones y configuración",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSubsectionTitle(doc, "Navegación Principal", y, "3.2");

  autoTable(doc, {
    startY: y,
    head: [["Sección", "Descripción"]],
    body: [
      ["Dashboard", "Vista general con métricas y estadísticas"],
      ["Proyectos", "Gestión de proyectos de investigación"],
      ["Producción Científica", "Registro de publicaciones y libros"],
      ["Evaluación", "Evaluación anual del investigador"],
      ["Mis Tareas", "Tareas asignadas y su estado"],
      ["Impactos", "Registro de impactos de investigación"],
      ["Vinculación", "Actividades de vinculación con la sociedad"],
      ["Institucional", "Información del grupo GISICF"],
      ["Perfil", "Configuración de cuenta personal"],
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

  y = addSectionTitle(doc, "GESTIÓN DE PROYECTOS", y, 4);

  y = addParagraph(
    doc,
    "Esta sección permite gestionar los proyectos de investigación en los que participa. Puede crear nuevos proyectos, visualizar los existentes y actualizar su estado.",
    y
  );

  y = addSubsectionTitle(doc, "Crear Nuevo Proyecto", y + 5, "4.1");

  y = addNumberedList(doc, [
    "Navegue a la sección 'Proyectos' desde el menú lateral",
    "Haga clic en el botón 'Nuevo Proyecto'",
    "Complete el formulario con la información del proyecto",
    "Seleccione el tipo de proyecto (Investigación Básica, Aplicada, Desarrollo Tecnológico, Innovación)",
    "Agregue los investigadores participantes",
    "Haga clic en 'Guardar' para registrar el proyecto",
  ], y);

  y = addSubsectionTitle(doc, "Tipos de Proyecto", y + 5, "4.2");

  autoTable(doc, {
    startY: y,
    head: [["Tipo", "Descripción"]],
    body: [
      ["Investigación Básica", "Investigación orientada a la generación de nuevo conocimiento"],
      ["Investigación Aplicada", "Aplicación práctica del conocimiento a problemas específicos"],
      ["Desarrollo Tecnológico", "Creación o mejora de productos, procesos o servicios"],
      ["Innovación", "Implementación de nuevas ideas con impacto social o económico"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 5: Scientific Production
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "PRODUCCIÓN CIENTÍFICA", y, 5);

  y = addParagraph(
    doc,
    "La sección de Producción Científica permite registrar y gestionar todas las publicaciones académicas, incluyendo artículos científicos y libros.",
    y
  );

  y = addSubsectionTitle(doc, "Artículos Científicos", y + 5, "5.1");

  y = addParagraph(
    doc,
    "Para registrar un artículo científico:",
    y
  );

  y = addNumberedList(doc, [
    "Navegue a 'Producción Científica' desde el menú",
    "Seleccione la pestaña 'Artículos'",
    "Haga clic en 'Agregar Artículo'",
    "Ingrese el DOI del artículo (el sistema obtendrá automáticamente los metadatos)",
    "Verifique la información y complete campos adicionales si es necesario",
    "Guarde el registro",
  ], y);

  y = addInfoBox(
    doc,
    "Consejo",
    "Al ingresar el DOI, el sistema buscará automáticamente la información del artículo (título, autores, revista, año). Esto agiliza el proceso de registro.",
    y,
    "tip"
  );

  y = addSubsectionTitle(doc, "Libros", y + 5, "5.2");

  y = addParagraph(
    doc,
    "Para registrar un libro:",
    y
  );

  y = addNumberedList(doc, [
    "Navegue a 'Producción Científica' desde el menú",
    "Seleccione la pestaña 'Libros'",
    "Haga clic en 'Agregar Libro'",
    "Ingrese el ISBN del libro",
    "Complete la información requerida",
    "Guarde el registro",
  ], y);

  // Section 6: Evaluation
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "EVALUACIÓN ANUAL", y, 6);

  y = addParagraph(
    doc,
    "La evaluación anual es un proceso fundamental para medir el desempeño investigativo de cada miembro del grupo GISICF. El sistema permite registrar evidencias en diferentes categorías.",
    y
  );

  y = addSubsectionTitle(doc, "Categorías de Evaluación", y + 5, "6.1");

  autoTable(doc, {
    startY: y,
    head: [["Categoría", "Peso", "Descripción"]],
    body: [
      ["A - Publicación Científica", "45 pts", "Artículos, libros, capítulos de libro, ponencias"],
      ["B - Transferencia de Tecnología", "10 pts", "Patentes, convocatorias, formación de investigadores"],
      ["C - Recursos Económicos", "15 pts", "Gestión de recursos para investigación"],
      ["D - Impactos", "30 pts", "Impactos sociales, ambientales, tecnológicos"],
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

  y = addSubsectionTitle(doc, "Proceso de Evaluación", y, "6.2");

  y = addNumberedList(doc, [
    "Navegue a la sección 'Evaluación' desde el menú",
    "Seleccione el año de evaluación correspondiente",
    "Complete cada categoría agregando las evidencias correspondientes",
    "Suba los documentos de respaldo requeridos",
    "Revise el resumen de su evaluación",
    "Envíe la evaluación para revisión del administrador",
  ], y);

  y = addInfoBox(
    doc,
    "Importante",
    "Una vez enviada la evaluación, no podrá realizar modificaciones a menos que el administrador devuelva la evaluación para correcciones.",
    y,
    "warning"
  );

  // Section 7: Tasks
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "MIS TAREAS", y, 7);

  y = addParagraph(
    doc,
    "La sección 'Mis Tareas' muestra todas las actividades asignadas según la planificación del grupo. Aquí puede ver sus tareas pendientes, en progreso y completadas.",
    y
  );

  y = addSubsectionTitle(doc, "Estados de las Tareas", y + 5, "7.1");

  autoTable(doc, {
    startY: y,
    head: [["Estado", "Descripción", "Acción Requerida"]],
    body: [
      ["Pendiente", "Tarea asignada sin iniciar", "Comenzar a trabajar"],
      ["En Progreso", "Tarea en desarrollo", "Continuar y completar"],
      ["Completada", "Tarea finalizada", "Subir evidencia"],
      ["Enviada", "Evidencia subida", "Esperar revisión"],
      ["Aprobada", "Evidencia aceptada", "Ninguna"],
      ["Rechazada", "Requiere corrección", "Revisar observaciones"],
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

  y = addSubsectionTitle(doc, "Subir Evidencia", y, "7.2");

  y = addNumberedList(doc, [
    "Localice la tarea completada en su lista",
    "Haga clic en el botón 'Subir Evidencia'",
    "Agregue una descripción de la evidencia",
    "Suba el archivo de respaldo (PDF, imagen, etc.)",
    "Opcionalmente agregue un enlace externo",
    "Envíe la evidencia para revisión",
  ], y);

  // Section 8: Impacts
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "IMPACTOS Y VINCULACIÓN", y, 8);

  y = addSubsectionTitle(doc, "Impactos de Investigación", y, "8.1");

  y = addParagraph(
    doc,
    "Los impactos representan los resultados tangibles de la investigación que benefician a la sociedad, el medio ambiente o el sector productivo.",
    y
  );

  y = addBulletList(doc, [
    "Impactos Sociales: Beneficios directos a la comunidad",
    "Impactos Ambientales: Contribuciones a la sostenibilidad",
    "Impactos Tecnológicos: Desarrollos e innovaciones",
    "Impactos Económicos: Generación de valor económico",
  ], y);

  y = addSubsectionTitle(doc, "Vinculación con la Sociedad", y + 5, "8.2");

  y = addParagraph(
    doc,
    "Las actividades de vinculación conectan la investigación con las necesidades de la comunidad. Incluyen:",
    y
  );

  y = addBulletList(doc, [
    "Capacitaciones y talleres comunitarios",
    "Proyectos de servicio social",
    "Transferencia de conocimiento",
    "Alianzas con instituciones externas",
  ], y);

  // Add institutional info screenshot
  y = await addScreenshot(doc, SCREENSHOTS.infoGeneral, y + 5, "Figura 8.1: Información General del Grupo GISICF");

  // Section 9: Profile
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSectionTitle(doc, "PERFIL DE USUARIO", y, 9);

  y = addParagraph(
    doc,
    "En la sección de Perfil puede gestionar su información personal, actualizar su fotografía, y administrar su currículum vitae.",
    y
  );

  // Add profile screenshot
  y = await addScreenshot(doc, SCREENSHOTS.perfil, y + 5, "Figura 9.1: Vista del perfil de usuario");

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE USUARIO - GISICF");

  y = addSubsectionTitle(doc, "Información Personal", y, "9.1");

  y = addBulletList(doc, [
    "Nombre completo",
    "Correo electrónico institucional",
    "Teléfono de contacto",
    "Código de investigador (si aplica)",
    "Rol en investigación",
    "Biografía profesional",
  ], y);

  y = addSubsectionTitle(doc, "Actualizar Perfil", y + 5, "9.2");

  y = addNumberedList(doc, [
    "Navegue a 'Perfil' desde el menú lateral",
    "Haga clic en 'Editar Perfil'",
    "Actualice los campos necesarios",
    "Para cambiar la foto, haga clic en el avatar",
    "Haga clic en 'Guardar Cambios'",
  ], y);

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
      a: "No directamente. Si necesita hacer correcciones, debe solicitar al administrador que devuelva su evaluación para modificaciones.",
    },
    {
      q: "¿Qué formatos de archivo puedo subir como evidencia?",
      a: "Se aceptan archivos PDF, imágenes (JPG, PNG), y documentos de Office. El tamaño máximo por archivo es de 10MB.",
    },
    {
      q: "¿Cómo agrego un proyecto en el que participo?",
      a: "Solo los investigadores principales pueden crear proyectos. Si participa en un proyecto, el investigador principal debe agregarlo como miembro del equipo.",
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
  doc.text("Carrera de Tecnologías de la Información", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 78, 121);
  doc.text(`Email: ${CONTACT_EMAIL}`, pageWidth / 2, y, { align: "center" });

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawManualPageFooter(doc, i - 1, totalPages - 1);
  }

  // Save PDF
  doc.save("Manual_Usuario_GISICF.pdf");
}
