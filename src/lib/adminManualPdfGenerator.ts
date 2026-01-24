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
    version: "2.0",
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
    { section: "2", title: "Dashboard Inteligente para Administradores", page: 4 },
    { section: "3", title: "Gestión de Usuarios (Directorio de Investigadores)", page: 6 },
    { section: "4", title: "Aprobación de Usuarios Pendientes", page: 8 },
    { section: "5", title: "Revisión de Evaluaciones", page: 10 },
    { section: "6", title: "Revisión de Tareas/Actividades", page: 12 },
    { section: "7", title: "Planificación Estratégica", page: 14 },
    { section: "8", title: "Proyectos Oficiales", page: 16 },
    { section: "9", title: "Configuración Institucional", page: 17 },
    { section: "10", title: "Gestión de Noticias", page: 19 },
    { section: "11", title: "Generación de Informes PDF", page: 20 },
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
    "El panel de administración es accesible desde el menú lateral. Las opciones administrativas aparecen en secciones separadas: 'Administración' y 'Revisiones'.",
    y
  );

  y = addSubsectionTitle(doc, "Funciones Administrativas Disponibles", y + 5, "1.2");

  autoTable(doc, {
    startY: y,
    head: [["Sección", "Función", "Descripción"]],
    body: [
      ["Administración", "Solicitudes Pendientes", "Aprobar o rechazar nuevos usuarios"],
      ["Administración", "Directorio de Investigadores", "Gestionar usuarios y roles"],
      ["Administración", "Planificación", "Crear y gestionar planes estratégicos"],
      ["Administración", "Proyectos Oficiales", "Administrar proyectos institucionales"],
      ["Revisiones", "Evaluaciones", "Revisar y calificar evaluaciones enviadas"],
      ["Revisiones", "Actividades", "Verificar evidencias de tareas"],
      ["Revisiones", "Configuración", "Ajustar parámetros del sistema"],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = addInfoBox(
    doc,
    "Seguridad",
    "Las funciones administrativas están protegidas por validación de roles tanto en el cliente como en el servidor (RBAC). Solo usuarios con rol de administrador pueden acceder a estas secciones. Los roles se almacenan en una tabla separada con Row Level Security.",
    y,
    "warning"
  );

  // Section 2: Dashboard for Admins
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "DASHBOARD INTELIGENTE PARA ADMINISTRADORES", y, 2);

  y = addParagraph(
    doc,
    "El Dashboard de administrador incluye todos los componentes del usuario regular más funcionalidades adicionales de gestión y accesos rápidos a tareas administrativas.",
    y
  );

  y = addSubsectionTitle(doc, "Componentes Exclusivos del Administrador", y + 5, "2.1");

  autoTable(doc, {
    startY: y,
    head: [["Componente", "Descripción"]],
    body: [
      ["Accesos Rápidos Admin", "Botones directos a: Revisar Evaluaciones, Revisar Tareas, Solicitudes, Directorio"],
      ["Estadísticas Admin", "Métricas globales: usuarios pendientes, evaluaciones por revisar, tareas enviadas"],
      ["Gestionar Noticias", "Botón para administrar el sistema de noticias del grupo"],
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

  y = addSubsectionTitle(doc, "Estadísticas del Dashboard Admin", y, "2.2");

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Descripción", "Ubicación"]],
    body: [
      ["Usuarios Pendientes", "Cantidad de registros esperando aprobación", "Tarjeta de estadísticas"],
      ["Evaluaciones por Revisar", "Evaluaciones enviadas sin revisar", "Tarjeta de estadísticas"],
      ["Tareas Enviadas", "Actividades con evidencia pendiente de revisión", "Tarjeta de estadísticas"],
      ["Usuarios Activos", "Total de usuarios aprobados en el sistema", "Panel de estado"],
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

  y = addSubsectionTitle(doc, "Recomendaciones Inteligentes para Admin", y, "2.3");

  y = addParagraph(
    doc,
    "El sistema de recomendaciones también funciona para administradores, mostrando alertas sobre:",
    y
  );

  y = addBulletList(doc, [
    "Usuarios pendientes de aprobación que esperan hace más de 24 horas",
    "Evaluaciones enviadas sin revisar",
    "Tareas con evidencia pendiente de verificación",
    "Planificaciones sin actividades asignadas",
  ], y);

  // Section 3: User Management
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "GESTIÓN DE USUARIOS (DIRECTORIO DE INVESTIGADORES)", y, 3);

  y = addSubsectionTitle(doc, "Directorio Unificado", y, "3.1");

  y = addParagraph(
    doc,
    "El directorio de investigadores muestra todos los usuarios registrados en el sistema. Como administrador, puede ver información adicional y gestionar roles.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.directorioUsuarios, y + 5, "Figura 3.1: Directorio de investigadores");

  y = addSubsectionTitle(doc, "Información Visible para Administradores", y + 5, "3.2");

  y = addBulletList(doc, [
    "Nombre completo con foto de perfil",
    "País de origen (bandera de Ecuador o Colombia)",
    "Correo electrónico institucional",
    "Código de investigador",
    "Rol actual (Investigador, Estudiante, Administrador)",
    "Rol de investigación (Director, Investigador Principal, etc.)",
    "ORCID validado",
    "Estado de aprobación",
    "Fecha de registro y último acceso",
    "Opción de descargar CV",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Cambiar Rol de Usuario", y, "3.3");

  y = addNumberedList(doc, [
    "Navegue a 'Directorio de Investigadores' en el panel de administración",
    "Localice el usuario que desea modificar usando la búsqueda",
    "Haga clic en el menú de acciones del usuario",
    "Seleccione 'Cambiar Rol de Investigación'",
    "Elija el nuevo rol del menú desplegable",
    "Confirme el cambio",
  ], y);

  y = addSubsectionTitle(doc, "Roles de Investigación Disponibles", y + 5, "3.4");

  autoTable(doc, {
    startY: y,
    head: [["Rol", "Descripción", "Permisos Especiales"]],
    body: [
      ["Director de Proyecto", "Líder del grupo de investigación", "Acceso admin automático"],
      ["Investigador Principal", "Investigador senior con liderazgo", "Ninguno adicional"],
      ["Investigador", "Miembro regular del grupo", "Ninguno adicional"],
      ["Investigador Asociado", "Investigador externo vinculado", "Ninguno adicional"],
      ["Estudiante Investigador", "Estudiante en formación", "Acceso limitado"],
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

  y = addInfoBox(
    doc,
    "Sincronización Automática",
    "Cuando un usuario es asignado como 'Director de Proyecto', el sistema automáticamente le otorga el rol de administrador mediante un trigger de base de datos.",
    y,
    "info"
  );

  // Section 4: Pending Approvals
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "APROBACIÓN DE USUARIOS PENDIENTES", y, 4);

  y = addParagraph(
    doc,
    "Cuando un nuevo usuario se registra en el sistema, su cuenta queda en estado pendiente hasta que un administrador la apruebe. Esta sección muestra todos los usuarios que esperan aprobación.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.solicitudesPendientes, y + 5, "Figura 4.1: Panel de solicitudes pendientes");

  y = addSubsectionTitle(doc, "Información del Registro", y + 5, "4.1");

  y = addBulletList(doc, [
    "Nombre completo del solicitante",
    "Correo electrónico (verificar que sea @unesum.edu.ec)",
    "Código de investigador proporcionado",
    "Teléfono de contacto",
    "Fecha y hora del registro",
  ], y);

  y = addSubsectionTitle(doc, "Proceso de Aprobación", y + 5, "4.2");

  y = addNumberedList(doc, [
    "Navegue a 'Solicitudes Pendientes' en el panel de administración",
    "Revise la lista de usuarios que esperan aprobación",
    "Para cada usuario, verifique su información de registro",
    "Confirme que el correo es institucional (@unesum.edu.ec)",
    "Verifique que el usuario pertenece o está vinculado al grupo GISICF",
    "Haga clic en 'Aprobar' para activar la cuenta",
    "O haga clic en 'Rechazar' para denegar el acceso",
    "El usuario recibirá una notificación por correo del resultado",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Criterios de Aprobación Recomendados", y, "4.3");

  y = addBulletList(doc, [
    "Correo electrónico institucional válido (@unesum.edu.ec)",
    "El usuario pertenece al grupo GISICF o está vinculado a un proyecto",
    "Código de investigador válido (si aplica)",
    "Información coherente y completa en el registro",
    "En caso de duda, consultar con el coordinador del grupo",
  ], y);

  y = addSubsectionTitle(doc, "Rechazo de Usuarios", y + 5, "4.4");

  y = addParagraph(
    doc,
    "Al rechazar una solicitud, el sistema envía un correo al usuario informando del rechazo. El usuario será eliminado del sistema y deberá registrarse nuevamente si desea intentar acceder.",
    y
  );

  y = addInfoBox(
    doc,
    "Recomendación",
    "Antes de rechazar, considere contactar al usuario por correo para aclarar cualquier duda sobre su elegibilidad.",
    y,
    "tip"
  );

  // Section 5: Evaluation Reviews
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "REVISIÓN DE EVALUACIONES", y, 5);

  y = addParagraph(
    doc,
    "La revisión de evaluaciones es una de las funciones más importantes del administrador. Aquí se verifican las evidencias presentadas por los investigadores en su evaluación anual.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.revisionEvaluaciones, y + 5, "Figura 5.1: Panel de revisión de evaluaciones");

  y = addSubsectionTitle(doc, "Panel de Revisión", y + 5, "5.1");

  y = addParagraph(
    doc,
    "El panel muestra todas las evaluaciones organizadas por estado:",
    y
  );

  autoTable(doc, {
    startY: y,
    head: [["Estado", "Color", "Descripción", "Acción Requerida"]],
    body: [
      ["Borrador", "Gris", "Evaluación en progreso", "Ninguna (usuario trabajando)"],
      ["Enviada", "Azul", "Lista para revisión", "Revisar y calificar"],
      ["Observada", "Amarillo", "Devuelta con correcciones", "Esperar reenvío"],
      ["Aprobada", "Verde", "Evaluación finalizada", "Generar PDF"],
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

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Proceso de Revisión Detallado", y, "5.2");

  y = addNumberedList(doc, [
    "Navegue a 'Revisión de Evaluaciones' en el menú de Revisiones",
    "Filtre por año si es necesario",
    "Seleccione una evaluación con estado 'Enviada'",
    "Se abrirá un modal con el detalle completo de la evaluación",
    "Revise cada categoría (Publicaciones, Transferencia, Recursos, Impactos)",
    "Verifique cada ítem y su evidencia adjunta",
    "Descargue y verifique los documentos de respaldo",
    "Agregue observaciones generales si es necesario",
    "Seleccione 'Aprobar' o 'Devolver para Corrección'",
  ], y);

  y = addSubsectionTitle(doc, "Devolver para Correcciones", y + 5, "5.3");

  y = addParagraph(
    doc,
    "Si encuentra inconsistencias o falta de documentación:",
    y
  );

  y = addNumberedList(doc, [
    "Identifique los ítems específicos que requieren corrección",
    "En el campo de observaciones, escriba instrucciones claras y específicas",
    "Indique exactamente qué documentos faltan o qué debe corregirse",
    "Opcionalmente establezca una fecha límite para las correcciones",
    "Haga clic en 'Devolver para Corrección'",
    "El investigador recibirá una notificación con sus observaciones",
  ], y);

  y = addInfoBox(
    doc,
    "Buenas Prácticas",
    "Sea específico en sus observaciones. Ejemplo: 'Ítem A.1.2: El documento adjunto no corresponde al artículo indicado. Por favor suba el PDF del artículo publicado.' Esto facilita el proceso al investigador.",
    y,
    "tip"
  );

  // Section 6: Task Reviews
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "REVISIÓN DE TAREAS/ACTIVIDADES", y, 6);

  y = addParagraph(
    doc,
    "Esta sección permite revisar las evidencias de las tareas completadas por los miembros del grupo según la planificación estratégica establecida.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.revisionActividades, y + 5, "Figura 6.1: Panel de revisión de actividades");

  y = addSubsectionTitle(doc, "Flujo de Revisión de Tareas", y + 5, "6.1");

  y = addBulletList(doc, [
    "El usuario completa una tarea y sube la evidencia (archivo + descripción + enlace opcional)",
    "La tarea aparece en 'Revisión de Actividades' con estado 'Enviada'",
    "El administrador revisa la evidencia presentada",
    "Se aprueba la tarea o se devuelve con observaciones",
    "El usuario es notificado del resultado",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Criterios de Aprobación de Tareas", y, "6.2");

  y = addBulletList(doc, [
    "La evidencia corresponde claramente a la actividad asignada",
    "El documento o enlace es accesible y legible",
    "La descripción proporcionada es coherente con la actividad",
    "La fecha de realización está dentro del período planificado",
    "La calidad del trabajo cumple con los estándares esperados",
  ], y);

  y = addSubsectionTitle(doc, "Acciones Disponibles", y + 5, "6.3");

  autoTable(doc, {
    startY: y,
    head: [["Acción", "Resultado", "Notificación"]],
    body: [
      ["Aprobar", "La tarea se marca como completada exitosamente", "Usuario notificado de aprobación"],
      ["Observar", "Se devuelve al usuario con observaciones para corrección", "Usuario recibe observaciones"],
      ["Ver Evidencia", "Abre el documento o enlace de respaldo", "Sin notificación"],
      ["Descargar", "Descarga el archivo de evidencia", "Sin notificación"],
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

  y = addSubsectionTitle(doc, "Filtros y Organización", y, "6.4");

  y = addBulletList(doc, [
    "Filtrar por plan de trabajo específico",
    "Filtrar por estado (Enviadas, Aprobadas, Observadas)",
    "Buscar por nombre de usuario o actividad",
    "Ordenar por fecha de envío o fecha límite",
  ], y);

  // Section 7: Planning
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "PLANIFICACIÓN ESTRATÉGICA", y, 7);

  y = addParagraph(
    doc,
    "El módulo de planificación permite crear y gestionar los planes de trabajo del grupo de investigación, asignando actividades a los miembros con fechas y medios de verificación.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.planificacion, y + 5, "Figura 7.1: Vista de planificación estratégica");

  y = addSubsectionTitle(doc, "Crear Nueva Planificación (Wizard de 4 Pasos)", y + 5, "7.1");

  y = addNumberedList(doc, [
    "Paso 1 - Información General: Período, presidente del comité, enlace de Drive, cronograma de reuniones",
    "Paso 2 - Equipo de Trabajo: Agregar miembros (Presidente, Coordinador, Responsable, Miembro)",
    "Paso 3 - Actividades: Definir actividades con objetivos, fechas, responsables y medios de verificación",
    "Paso 4 - Vista Previa: Revisar el plan completo antes de guardar",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Estructura de una Actividad", y, "7.2");

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Descripción", "Obligatorio"]],
    body: [
      ["Actividad", "Descripción clara de la tarea a realizar", "Sí"],
      ["Objetivo", "Meta que se espera alcanzar con la actividad", "Sí"],
      ["Fecha Inicio", "Cuándo debe comenzar la actividad", "Sí"],
      ["Fecha Fin", "Fecha límite de cumplimiento", "Sí"],
      ["Responsables", "Miembros asignados (selección múltiple)", "Sí"],
      ["Medio de Verificación", "Cómo se comprobará el cumplimiento", "Sí"],
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

  y = addSubsectionTitle(doc, "Asignación Automática de Tareas", y, "7.3");

  y = addParagraph(
    doc,
    "Al guardar una planificación con estado 'Activo', el sistema crea automáticamente tareas individuales para cada responsable de cada actividad. Los usuarios podrán ver sus tareas en la sección 'Mis Tareas'.",
    y
  );

  y = addInfoBox(
    doc,
    "Importante",
    "Las tareas se crean según los responsables definidos en cada actividad. Si modifica los responsables después de crear la planificación, debe actualizar las tareas manualmente.",
    y,
    "warning"
  );

  y = addSubsectionTitle(doc, "Generar PDF de Planificación", y + 5, "7.4");

  y = addParagraph(
    doc,
    "Desde la lista de planificaciones, puede generar un PDF oficial que incluye el encabezado institucional, todas las actividades en formato de tabla, y las firmas configuradas en el sistema.",
    y
  );

  // Section 8: Official Projects
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "PROYECTOS OFICIALES", y, 8);

  y = addParagraph(
    doc,
    "Los proyectos oficiales son aquellos registrados institucionalmente y que aparecen como opciones para vincular en las evaluaciones de los investigadores.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.proyectosOficiales, y + 5, "Figura 8.1: Gestión de proyectos oficiales");

  y = addSubsectionTitle(doc, "Gestionar Proyectos Oficiales", y + 5, "8.1");

  y = addNumberedList(doc, [
    "Navegue a 'Proyectos Oficiales' en el panel de administración",
    "Visualice la lista de proyectos registrados por año",
    "Para agregar un nuevo proyecto, haga clic en 'Nuevo Proyecto'",
    "Complete el nombre del proyecto y seleccione el año",
    "Opcionalmente suba el documento del proyecto (PDF)",
    "Guarde el proyecto",
  ], y);

  y = addSubsectionTitle(doc, "Uso en Evaluaciones", y + 5, "8.2");

  y = addParagraph(
    doc,
    "Los proyectos oficiales aparecen como opciones cuando los investigadores registran indicadores relacionados con proyectos de investigación en su evaluación anual. Esto permite vincular las actividades con los proyectos institucionales y generar reportes consolidados.",
    y
  );

  // Section 9: Institutional Config
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "CONFIGURACIÓN INSTITUCIONAL", y, 9);

  y = addParagraph(
    doc,
    "La sección de configuración permite ajustar parámetros globales del sistema que afectan a los documentos PDF generados y la información institucional mostrada.",
    y
  );

  // Add screenshot
  y = await addScreenshot(doc, SCREENSHOTS.configuracion, y + 5, "Figura 9.1: Panel de configuración del sistema");

  y = addSubsectionTitle(doc, "Configuración de Encabezados PDF", y + 5, "9.1");

  y = addBulletList(doc, [
    "Nombre de la institución: Universidad Estatal del Sur de Manabí",
    "Subtexto del encabezado: Texto adicional bajo el nombre",
    "Nombre de la facultad: Facultad de Ciencias Técnicas",
    "Nombre de la carrera: Tecnologías de la Información",
    "Logo izquierdo: URL del logo de la universidad",
    "Logo derecho: URL del logo de la carrera",
  ], y);

  y = addSubsectionTitle(doc, "Configuración de Firmas", y + 5, "9.2");

  y = addBulletList(doc, [
    "Nombre del Presidente: Aparece en documentos de planificación",
    "Nombre del Coordinador: Aparece en informes de evaluación",
    "Nombre del Responsable: Aparece en documentos oficiales",
  ], y);

  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSubsectionTitle(doc, "Información Institucional Editable", y, "9.3");

  y = addParagraph(
    doc,
    "Desde la página de Información Institucional, puede editar:",
    y
  );

  y = addBulletList(doc, [
    "Misión: Declaración de propósito del grupo",
    "Visión: Proyección futura del grupo",
    "Objetivos: Metas específicas de investigación",
    "Líneas de Investigación: Áreas temáticas (gestión CRUD completa)",
  ], y);

  y = addSubsectionTitle(doc, "Subir Documentos PDF Institucionales", y + 5, "9.4");

  y = addNumberedList(doc, [
    "Navegue a la sección 'Información GISICF'",
    "Localice el documento que desea actualizar",
    "Haga clic en 'Seleccionar archivo' o arrastre el PDF",
    "El archivo se subirá automáticamente al bucket de storage",
    "El documento estará disponible para descarga de todos los usuarios",
  ], y);

  y = addInfoBox(
    doc,
    "Importante",
    "Los cambios en la configuración afectan inmediatamente a todos los documentos PDF generados por el sistema. Verifique la información antes de guardar.",
    y,
    "warning"
  );

  // Section 10: News Management
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "GESTIÓN DE NOTICIAS", y, 10);

  y = addParagraph(
    doc,
    "El sistema de noticias permite comunicar información importante a todos los usuarios del sistema. Las noticias aparecen en el Dashboard en un carrusel visual y pueden incluir imágenes y videos.",
    y
  );

  y = addSubsectionTitle(doc, "Crear Nueva Noticia", y + 5, "10.1");

  y = addNumberedList(doc, [
    "Desde el Dashboard, haga clic en 'Gestionar Noticias'",
    "En el modal, haga clic en 'Nueva Noticia'",
    "Complete el título de la noticia (máx. 100 caracteres)",
    "Agregue una descripción corta (visible en la tarjeta del carrusel)",
    "Escriba el contenido completo de la noticia",
    "Suba una imagen destacada (obligatorio, formatos JPG/PNG)",
    "Opcionalmente agregue un enlace de video (YouTube, Vimeo)",
    "Active la opción 'Visible' para que se muestre",
    "Publique la noticia",
  ], y);

  y = addSubsectionTitle(doc, "Gestionar Noticias Existentes", y + 5, "10.2");

  autoTable(doc, {
    startY: y,
    head: [["Acción", "Descripción"]],
    body: [
      ["Editar", "Modificar cualquier campo de una noticia publicada"],
      ["Desactivar", "Ocultar la noticia sin eliminarla (toggle Visible)"],
      ["Eliminar", "Borrar permanentemente la noticia y su imagen"],
      ["Previsualizar", "Ver cómo se muestra la noticia completa"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [31, 78, 121],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 11: PDF Reports
  doc.addPage();
  y = drawManualPageHeader(doc, "MANUAL DE ADMINISTRADOR - GISICF");

  y = addSectionTitle(doc, "GENERACIÓN DE INFORMES PDF", y, 11);

  y = addParagraph(
    doc,
    "El sistema permite generar diversos documentos PDF oficiales con el formato institucional de UNESUM.",
    y
  );

  y = addSubsectionTitle(doc, "Tipos de Documentos Generables", y + 5, "11.1");

  autoTable(doc, {
    startY: y,
    head: [["Documento", "Contenido", "Ubicación"]],
    body: [
      ["Informe de Evaluación", "Evaluación individual con puntajes y evidencias", "Revisión de Evaluaciones"],
      ["Informe General de Evaluación", "Consolidado de todas las evaluaciones aprobadas del año", "Revisión de Evaluaciones"],
      ["Planificación Estratégica", "Plan de trabajo con actividades y responsables", "Planificación"],
      ["Manual de Usuario", "Guía completa para investigadores", "Información GISICF"],
      ["Manual de Administrador", "Guía de gestión del sistema", "Información GISICF"],
      ["Ficha Técnica", "Especificaciones técnicas del sistema", "Información GISICF"],
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

  y = addSubsectionTitle(doc, "Elementos del Encabezado PDF", y, "11.2");

  y = addBulletList(doc, [
    "Logos institucionales (izquierdo y derecho)",
    "Nombre de la institución",
    "Facultad y carrera",
    "Subtexto configurable",
  ], y);

  y = addSubsectionTitle(doc, "Generar Informe General de Evaluación", y + 5, "11.3");

  y = addNumberedList(doc, [
    "Navegue a 'Revisión de Evaluaciones'",
    "Haga clic en 'Generar Informe General (PDF)'",
    "Seleccione el año académico",
    "El sistema compilará todas las evaluaciones aprobadas",
    "Se generará un PDF con tabla resumen y firmas institucionales",
  ], y);

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
  doc.save("Manual_Administrador_GISICF.pdf");
}
