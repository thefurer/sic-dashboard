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
  solicitudesPendientes: "/manual-screenshots/solicitudes-pendientes.png",
  directorioUsuarios: "/manual-screenshots/directorio-usuarios.png",
  planificacion: "/manual-screenshots/planificacion.png",
  proyectosOficiales: "/manual-screenshots/proyectos-oficiales.png",
  revisionEvaluaciones: "/manual-screenshots/revision-evaluaciones.png",
  revisionActividades: "/manual-screenshots/revision-actividades.png",
  configuracion: "/manual-screenshots/configuracion.png",
};

export async function generateAdminManualPDF() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cover page
  const coverData: ManualCoverData = {
    title: "MANUAL DE ADMINISTRADOR",
    subtitle: "Guía de gestión y administración del sistema GISICF",
    version: "1.0",
    date: new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long" }),
    documentType: "manual_admin",
  };

  await drawManualCover(doc, coverData);

  // Table of Contents
  doc.addPage();
  let y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(31, 78, 121);
  doc.text("ÍNDICE DE CONTENIDOS", pageWidth / 2, y, { align: "center" });
  y += 15;

  const tocItems = [
    { section: "1", title: "Panel de Administración", page: 3 },
    { section: "2", title: "Gestión de Usuarios", page: 4 },
    { section: "3", title: "Aprobación de Usuarios Pendientes", page: 6 },
    { section: "4", title: "Revisión de Evaluaciones", page: 8 },
    { section: "5", title: "Revisión de Tareas", page: 10 },
    { section: "6", title: "Planificación y Actividades", page: 12 },
    { section: "7", title: "Proyectos Oficiales", page: 14 },
    { section: "8", title: "Configuración Institucional", page: 15 },
    { section: "9", title: "Gestión de Noticias", page: 16 },
    { section: "10", title: "Configuración del Sistema", page: 17 },
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

  // Section 1: Admin Panel
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "PANEL DE ADMINISTRACIÓN", y, 1);

  y = addParagraph(
    doc,
    "Como administrador del sistema GISICF, usted tiene acceso a funcionalidades avanzadas de gestión que no están disponibles para usuarios regulares. Este manual le guiará en el uso de todas las herramientas administrativas.",
    y
  );

  y = addSubsectionTitle(doc, "Acceso al Panel de Administración", y + 5, "1.1");

  y = addParagraph(
    doc,
    "El panel de administración es accesible desde el menú lateral. Las opciones administrativas aparecen en una sección separada marcada como 'Administración'.",
    y
  );

  y = addSubsectionTitle(doc, "Funciones Administrativas Disponibles", y + 5, "1.2");

  autoTable(doc, {
    startY: y,
    head: [["Función", "Descripción"]],
    body: [
      ["Usuarios Pendientes", "Aprobar o rechazar nuevos registros de usuarios"],
      ["Directorio de Usuarios", "Gestionar todos los usuarios del sistema"],
      ["Revisión de Evaluaciones", "Revisar y calificar evaluaciones enviadas"],
      ["Revisión de Tareas", "Verificar evidencias de tareas completadas"],
      ["Planificación", "Crear y gestionar planes de actividades"],
      ["Proyectos Oficiales", "Administrar proyectos institucionales"],
      ["Configuración", "Ajustar parámetros del sistema"],
    ],
    theme: "striped",
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
    "Seguridad",
    "Las funciones administrativas están protegidas por validación de roles tanto en el cliente como en el servidor. Solo usuarios con rol de administrador pueden acceder a estas secciones.",
    y,
    "warning"
  );

  // Section 2: User Management
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "GESTIÓN DE USUARIOS", y, 2);

  y = addSubsectionTitle(doc, "Directorio de Usuarios", y, "2.1");

  y = addParagraph(
    doc,
    "El directorio de usuarios muestra todos los usuarios registrados en el sistema. Desde aquí puede ver su información, cambiar roles y gestionar su estado.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.directorioUsuarios, y + 5, "Figura 2.1: Directorio de usuarios del sistema");

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Información de Usuario", y, "2.2");

  y = addBulletList(doc, [
    "Nombre completo y correo electrónico",
    "Rol actual (Investigador, Estudiante, Administrador)",
    "Estado de aprobación",
    "Fecha de registro",
    "Código de investigador (si aplica)",
    "Información de contacto",
  ], y);

  y = addSubsectionTitle(doc, "Cambiar Rol de Usuario", y + 5, "2.3");

  y = addNumberedList(doc, [
    "Navegue a 'Directorio de Usuarios' en el panel de administración",
    "Localice el usuario que desea modificar",
    "Haga clic en el botón de editar rol",
    "Seleccione el nuevo rol del menú desplegable",
    "Confirme el cambio",
  ], y);

  y = addInfoBox(
    doc,
    "Precaución",
    "Cambiar el rol de un usuario afecta inmediatamente sus permisos de acceso. Asegúrese de que el usuario está informado del cambio.",
    y,
    "warning"
  );

  // Section 3: Pending Approvals
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "APROBACIÓN DE USUARIOS PENDIENTES", y, 3);

  y = addParagraph(
    doc,
    "Cuando un nuevo usuario se registra en el sistema, su cuenta queda en estado pendiente hasta que un administrador la apruebe. Esta sección muestra todos los usuarios que esperan aprobación.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.solicitudesPendientes, y + 5, "Figura 3.1: Panel de solicitudes pendientes");

  y = addSubsectionTitle(doc, "Proceso de Aprobación", y + 5, "3.1");

  y = addNumberedList(doc, [
    "Navegue a 'Usuarios Pendientes' en el panel de administración",
    "Revise la lista de usuarios que esperan aprobación",
    "Para cada usuario, verifique su información de registro",
    "Haga clic en 'Aprobar' para activar la cuenta, o 'Rechazar' para denegar el acceso",
    "El usuario recibirá una notificación del resultado",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Criterios de Aprobación", y, "3.2");

  y = addBulletList(doc, [
    "Verificar que el correo electrónico sea institucional (@unesum.edu.ec)",
    "Confirmar que el usuario pertenece al grupo GISICF o está vinculado a un proyecto",
    "Validar la información proporcionada en el registro",
    "Consultar con el coordinador si hay dudas sobre la elegibilidad",
  ], y);

  y = addSubsectionTitle(doc, "Rechazo de Usuarios", y + 5, "3.3");

  y = addParagraph(
    doc,
    "Si rechaza una solicitud de registro, el usuario será eliminado del sistema y deberá registrarse nuevamente si desea intentar acceder. Considere contactar al usuario antes de rechazar para aclarar cualquier duda.",
    y
  );

  // Section 4: Evaluation Reviews
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "REVISIÓN DE EVALUACIONES", y, 4);

  y = addParagraph(
    doc,
    "La revisión de evaluaciones es una de las funciones más importantes del administrador. Aquí se verifican las evidencias presentadas por los investigadores en su evaluación anual.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.revisionEvaluaciones, y + 5, "Figura 4.1: Panel de revisión de evaluaciones");

  y = addSubsectionTitle(doc, "Panel de Revisión", y + 5, "4.1");

  y = addParagraph(
    doc,
    "El panel muestra todas las evaluaciones organizadas por estado:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Estado", "Descripción", "Acción Requerida"]],
    body: [
      ["Borrador", "Evaluación en progreso, no enviada", "Ninguna (usuario trabajando)"],
      ["Enviada", "Lista para revisión", "Revisar y calificar"],
      ["Devuelta", "Requiere correcciones del usuario", "Esperar reenvío"],
      ["Aprobada", "Evaluación finalizada y aceptada", "Ninguna"],
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

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Proceso de Revisión", y, "4.2");

  y = addNumberedList(doc, [
    "Navegue a 'Revisión de Evaluaciones' en el panel de administración",
    "Seleccione una evaluación con estado 'Enviada'",
    "Revise cada categoría y sus evidencias",
    "Verifique que los documentos de respaldo sean válidos",
    "Agregue observaciones si es necesario",
    "Apruebe la evaluación o devuélvala para correcciones",
  ], y);

  y = addSubsectionTitle(doc, "Devolver para Correcciones", y + 5, "4.3");

  y = addParagraph(
    doc,
    "Si encuentra inconsistencias o falta de documentación, puede devolver la evaluación al investigador:",
    y
  );

  y = addNumberedList(doc, [
    "Identifique los elementos que requieren corrección",
    "Escriba observaciones claras y específicas",
    "Establezca una fecha límite para las correcciones",
    "Haga clic en 'Devolver para Corrección'",
    "El investigador recibirá una notificación",
  ], y);

  y = addInfoBox(
    doc,
    "Recomendación",
    "Sea específico en sus observaciones. Indique exactamente qué documentos faltan o qué información debe corregirse para facilitar el proceso al investigador.",
    y,
    "tip"
  );

  // Section 5: Task Reviews
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "REVISIÓN DE TAREAS", y, 5);

  y = addParagraph(
    doc,
    "Esta sección permite revisar las evidencias de las tareas completadas por los miembros del grupo según la planificación establecida.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.revisionActividades, y + 5, "Figura 5.1: Panel de revisión de actividades");

  y = addSubsectionTitle(doc, "Flujo de Revisión de Tareas", y + 5, "5.1");

  y = addBulletList(doc, [
    "El usuario completa una tarea y sube la evidencia",
    "La tarea aparece en 'Revisión de Tareas' con estado 'Enviada'",
    "El administrador revisa la evidencia presentada",
    "Se aprueba la tarea o se devuelve con observaciones",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Criterios de Aprobación de Tareas", y, "5.2");

  y = addBulletList(doc, [
    "La evidencia corresponde a la actividad asignada",
    "El documento o enlace es accesible y legible",
    "La fecha de realización está dentro del período planificado",
    "La calidad del trabajo cumple con los estándares esperados",
  ], y);

  y = addSubsectionTitle(doc, "Acciones Disponibles", y + 5, "5.3");

  autoTable(doc, {
    startY: y,
    head: [["Acción", "Resultado"]],
    body: [
      ["Aprobar", "La tarea se marca como completada exitosamente"],
      ["Rechazar", "Se devuelve al usuario con observaciones para corrección"],
      ["Ver Evidencia", "Abre el documento o enlace de respaldo"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 6: Planning
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "PLANIFICACIÓN Y ACTIVIDADES", y, 6);

  y = addParagraph(
    doc,
    "El módulo de planificación permite crear y gestionar los planes de trabajo del grupo de investigación, asignando actividades a los miembros.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.planificacion, y + 5, "Figura 6.1: Vista de planificación estratégica");

  y = addSubsectionTitle(doc, "Crear Nueva Planificación", y + 5, "6.1");

  y = addNumberedList(doc, [
    "Navegue a 'Planificación' en el panel de administración",
    "Haga clic en 'Nueva Planificación'",
    "Complete la información general del plan (período, presidente, etc.)",
    "Agregue los miembros del equipo de trabajo",
    "Defina las actividades con sus fechas y responsables",
    "Revise el plan completo en la vista previa",
    "Guarde y active la planificación",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Estructura de una Actividad", y, "6.2");

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Descripción"]],
    body: [
      ["Actividad", "Descripción de la tarea a realizar"],
      ["Objetivo", "Meta que se espera alcanzar"],
      ["Fecha Inicio", "Cuándo debe comenzar la actividad"],
      ["Fecha Fin", "Fecha límite de cumplimiento"],
      ["Responsables", "Miembros asignados a la actividad"],
      ["Medio de Verificación", "Cómo se comprobará el cumplimiento"],
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

  y = addSubsectionTitle(doc, "Asignación de Tareas", y, "6.3");

  y = addParagraph(
    doc,
    "Al activar una planificación, el sistema crea automáticamente tareas individuales para cada responsable de cada actividad. Los usuarios podrán ver sus tareas en la sección 'Mis Tareas'.",
    y
  );

  y = addInfoBox(
    doc,
    "Nota",
    "Las tareas se crean según los responsables definidos en cada actividad. Asegúrese de asignar correctamente a todos los miembros involucrados.",
    y,
    "info"
  );

  // Section 7: Official Projects
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "PROYECTOS OFICIALES", y, 7);

  y = addParagraph(
    doc,
    "Los proyectos oficiales son aquellos registrados institucionalmente y que aparecen como opciones para vincular en las evaluaciones de los investigadores.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.proyectosOficiales, y + 5, "Figura 7.1: Gestión de proyectos oficiales");

  y = addSubsectionTitle(doc, "Gestionar Proyectos Oficiales", y + 5, "7.1");

  y = addNumberedList(doc, [
    "Navegue a 'Proyectos Oficiales' en el panel de administración",
    "Visualice la lista de proyectos registrados",
    "Para agregar un nuevo proyecto, haga clic en 'Nuevo Proyecto'",
    "Complete el nombre del proyecto y el año",
    "Opcionalmente suba el documento del proyecto",
    "Guarde el proyecto",
  ], y);

  y = addSubsectionTitle(doc, "Uso en Evaluaciones", y + 5, "7.2");

  y = addParagraph(
    doc,
    "Los proyectos oficiales aparecen como opciones cuando los investigadores registran indicadores relacionados con proyectos de investigación en su evaluación anual. Esto permite vincular las actividades con los proyectos institucionales.",
    y
  );

  // Section 8: Institutional Config
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "CONFIGURACIÓN INSTITUCIONAL", y, 8);

  y = addParagraph(
    doc,
    "La página de Información Institucional contiene datos del grupo GISICF que pueden ser editados por los administradores.",
    y
  );

  y = addSubsectionTitle(doc, "Elementos Editables", y + 5, "8.1");

  y = addBulletList(doc, [
    "Misión: Declaración de propósito del grupo",
    "Visión: Proyección futura del grupo",
    "Objetivos: Metas específicas de investigación",
    "Líneas de Investigación: Áreas temáticas del grupo",
    "Documentos institucionales (Registro, Instructivo, Plan de Trabajo, Planificación)",
  ], y);

  y = addSubsectionTitle(doc, "Subir Documentos PDF", y + 5, "8.2");

  y = addNumberedList(doc, [
    "Navegue a la sección 'Institucional'",
    "Localice el documento que desea actualizar",
    "Haga clic en 'Seleccionar archivo' o arrastre el PDF",
    "El archivo se subirá automáticamente",
    "El documento estará disponible para descarga de todos los usuarios",
  ], y);

  y = addSubsectionTitle(doc, "Gestionar Líneas de Investigación", y + 5, "8.3");

  y = addNumberedList(doc, [
    "En la sección 'Institucional', busque 'Líneas de Investigación'",
    "Haga clic en 'Editar' para abrir el gestor",
    "Agregue, edite o elimine líneas según sea necesario",
    "Guarde los cambios",
  ], y);

  // Section 9: News Management
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "GESTIÓN DE NOTICIAS", y, 9);

  y = addParagraph(
    doc,
    "El sistema de noticias permite comunicar información importante a todos los usuarios del sistema. Las noticias aparecen en el Dashboard y pueden incluir imágenes y videos.",
    y
  );

  y = addSubsectionTitle(doc, "Crear Nueva Noticia", y + 5, "9.1");

  y = addNumberedList(doc, [
    "Desde el Dashboard o la sección de noticias, haga clic en 'Nueva Noticia'",
    "Complete el título de la noticia",
    "Agregue una descripción corta (resumen visible en tarjetas)",
    "Escriba el contenido completo de la noticia",
    "Suba una imagen destacada (obligatorio)",
    "Opcionalmente agregue un enlace de video",
    "Marque como activa para que sea visible",
    "Publique la noticia",
  ], y);

  y = addSubsectionTitle(doc, "Gestionar Noticias Existentes", y + 5, "9.2");

  y = addBulletList(doc, [
    "Editar: Modificar cualquier campo de una noticia publicada",
    "Desactivar: Ocultar la noticia sin eliminarla",
    "Eliminar: Borrar permanentemente la noticia",
    "Ver: Previsualizar cómo se ve la noticia completa",
  ], y);

  // Section 10: System Settings
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "CONFIGURACIÓN DEL SISTEMA", y, 10);

  y = addParagraph(
    doc,
    "La sección de configuración permite ajustar parámetros globales del sistema que afectan a todas las funcionalidades.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.configuracion, y + 5, "Figura 10.1: Panel de configuración del sistema");

  y = addSubsectionTitle(doc, "Configuración de Encabezados PDF", y + 5, "10.1");

  y = addBulletList(doc, [
    "Nombre de la institución",
    "Subtexto del encabezado",
    "Nombre de la facultad",
    "Nombre de la carrera",
    "Logos izquierdo y derecho",
  ], y);

  y = addSubsectionTitle(doc, "Configuración de Firmas", y + 5, "10.2");

  y = addParagraph(
    doc,
    "Los nombres para las firmas en documentos oficiales:",
    y
  );

  y = addBulletList(doc, [
    "Nombre del Presidente",
    "Nombre del Coordinador",
    "Nombre del Responsable",
  ], y);

  y = addInfoBox(
    doc,
    "Importante",
    "Los cambios en la configuración afectan a todos los documentos PDF generados por el sistema. Verifique la información antes de guardar.",
    y,
    "warning"
  );

  // Final page - Contact
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "SOPORTE Y CONTACTO", y);

  y = addParagraph(
    doc,
    "Para soporte técnico o consultas sobre el sistema GISICF, puede contactar a:",
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
  doc.save("Manual_Administrador_GISICF.pdf");
}
