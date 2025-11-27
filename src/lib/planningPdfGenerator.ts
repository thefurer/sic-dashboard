import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function generatePlanningPDF(planData: any) {
  const { plan, activities, members } = planData;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PLANIFICACIÓN GENERAL", doc.internal.pageSize.getWidth() / 2, 20, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.text(plan.period_name, doc.internal.pageSize.getWidth() / 2, 28, {
    align: "center",
  });

  // Datos Generales
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let y = 40;

  doc.text(`Presidente: ${plan.president_name}`, 14, y);
  y += 6;
  doc.text(`Horario de Reuniones: ${plan.meeting_schedule}`, 14, y);
  y += 6;

  if (plan.drive_link) {
    doc.text(`Enlace Drive: ${plan.drive_link}`, 14, y);
    y += 6;
  }

  // Team Members
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("CONFORMACIÓN DEL EQUIPO", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const docentes = members?.filter((m: any) => m.member_type === "docente") || [];
  const estudiantes = members?.filter((m: any) => m.member_type === "estudiante") || [];

  doc.text("Miembros Docentes:", 14, y);
  y += 5;
  docentes.forEach((m: any) => {
    doc.text(`• ${m.profiles.full_name}`, 18, y);
    y += 5;
  });

  y += 2;
  doc.text("Estudiantes:", 14, y);
  y += 5;
  estudiantes.forEach((m: any) => {
    doc.text(`• ${m.profiles.full_name}`, 18, y);
    y += 5;
  });

  // Activities Table
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("CRONOGRAMA DE ACTIVIDADES", 14, y);
  y += 6;

  const tableData = activities.map((activity: any, index: number) => [
    (index + 1).toString(),
    activity.activity,
    activity.objective,
    `${format(new Date(activity.start_date), "dd/MM/yyyy", { locale: es })} - ${format(
      new Date(activity.end_date),
      "dd/MM/yyyy",
      { locale: es }
    )}`,
    activity.responsibles.join(", "),
    activity.verification_means,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["N°", "Actividad", "Objetivo", "Fecha", "Responsable", "Medios de Verificación"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 },
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Observación: Todos los miembros del grupo deben estar afiliados a la UTE.",
    14,
    finalY
  );

  // Signatures
  const sigY = finalY + 15;
  doc.setFont("helvetica", "normal");
  doc.text("_______________________", 30, sigY);
  doc.text("_______________________", 120, sigY);
  doc.text("Presidente", 45, sigY + 5);
  doc.text("Coordinador", 135, sigY + 5);

  // Save
  doc.save(`Planificacion_${plan.period_name.replace(/\s+/g, "_")}.pdf`);
}
