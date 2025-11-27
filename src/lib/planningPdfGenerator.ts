import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { drawPDFHeader } from "./pdfHeaderUtils";
import { supabase } from "@/integrations/supabase/client";

function drawPageFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - 20;

  // Draw separator line (Navy Blue)
  doc.setDrawColor(31, 78, 121); // Navy Blue #1F4E79
  doc.setLineWidth(0.8);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  // Email line (Navy Blue, Bold)
  doc.setTextColor(31, 78, 121);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("E-mail: ingenieria.ti@unesum.edu.ec", pageWidth / 2, footerY, { align: "center" });

  // Address line (Black, Regular)
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Complejo Deportivo – UNESUM – Km. 1 vía Noboa", pageWidth / 2, footerY + 4, { align: "center" });
}

export async function generatePlanningPDF(planData: any) {
  const { plan, activities, members } = planData;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw institutional header
  let y = await drawPDFHeader(doc);
  y += 8;

  // Title Block (matching reference image)
  // Main Title - PLANIFICACIÓN GENERAL
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(218, 238, 243); // Light blue background
  doc.rect(14, y - 4, pageWidth - 28, 10, "F");
  doc.text("PLANIFICACIÓN GENERAL", pageWidth / 2, y + 2, { align: "center" });

  y += 12;

  // Subtitle - Research Group Name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Grupo de Investigación en Sistemas Inteligentes y Ciberfísicos", pageWidth / 2, y, {
    align: "center",
  });

  y += 7;

  // Period
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Período Académico ${plan.period_name}`, pageWidth / 2, y, {
    align: "center",
  });

  y += 6;

  // Meeting frequency footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const meetingText = `Acompañamiento y seguimiento de tareas asignadas: ${plan.meeting_schedule}`;
  doc.text(meetingText, pageWidth / 2, y, { align: "center" });

  y += 10;

  // Table 1: Team Structure (matching reference image layout)
  const docentes = members?.filter((m: any) => m.member_type === "docente") || [];
  const estudiantes = members?.filter((m: any) => m.member_type === "estudiante") || [];
  
  // Combine all members for MIEMBROS row
  const allMembersList = [
    ...docentes.map((m: any) => m.profiles.full_name),
    ...estudiantes.map((m: any) => m.profiles.full_name),
  ].join("\n");

  // Get responsible/coordinator name (first docente or use president as fallback)
  const responsableName = docentes.length > 0 
    ? docentes[0].profiles.full_name 
    : plan.president_name;

  const teamTableData = [
    ["PRESIDENTE", plan.president_name],
    ["RESPONSABLE", responsableName],
    ["MIEMBROS", allMembersList],
  ];

  autoTable(doc, {
    startY: y,
    body: teamTableData,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      valign: "top",
    },
    columnStyles: {
      0: {
        cellWidth: 40,
        fontStyle: "bold",
        halign: "left",
      },
      1: {
        cellWidth: pageWidth - 68,
        fontStyle: "normal",
        halign: "left",
      },
    },
  });

  // Add space before activities table
  y = (doc as any).lastAutoTable.finalY + 10;

  // Table 2: Activities Matrix (matching reference image styling)
  const activitiesTableData = activities.map((activity: any, index: number) => {
    // Format dates with line breaks
    const startDate = format(new Date(activity.start_date), "dd/MM/yyyy", { locale: es });
    const endDate = format(new Date(activity.end_date), "dd/MM/yyyy", { locale: es });
    const dateText = `Inicio:\n${startDate}\nHasta\n${endDate}\n\nReuniones\ncada mes`;

    // Format responsibles with line breaks
    const responsiblesText = activity.responsibles.join("\n\n");

    return [
      (index + 1).toString(),
      activity.activity,
      activity.objective,
      dateText,
      responsiblesText,
      activity.verification_means,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["N°", "ACTIVIDADES", "OBJETIVOS", "FECHA", "RESPONSABLE", "MEDIOS DE\nVERIFICACIÓN"]],
    body: activitiesTableData,
    theme: "grid",
    headStyles: {
      fillColor: [218, 238, 243], // Light blue (#daeef3)
      textColor: [0, 0, 0], // Black text
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      valign: "middle",
      overflow: "linebreak",
    },
    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
      },
      1: {
        cellWidth: 42,
        halign: "left",
      },
      2: {
        cellWidth: 42,
        halign: "left",
      },
      3: {
        cellWidth: 28,
        halign: "center",
        fontSize: 7,
      },
      4: {
        cellWidth: 38,
        halign: "center",
        fontSize: 8,
      },
      5: {
        cellWidth: 30,
        halign: "left",
      },
    },
    didDrawPage: (data: any) => {
      // Draw footer on every page
      drawPageFooter(doc);
    },
  });

  // Footer observations
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Observación: Todos los miembros del grupo deben estar afiliados a la UTE.",
    14,
    finalY
  );

  // Check if there's enough space for signatures (need at least 60mm for wrapped text)
  const pageHeight = doc.internal.pageSize.getHeight();
  if (pageHeight - finalY < 60) {
    doc.addPage();
    drawPageFooter(doc);
    finalY = 40;
  } else {
    finalY += 30;
  }

  // Fetch signature names from settings
  const { data: settings } = await supabase
    .from("app_settings")
    .select("signature_president_name, signature_coordinator_name")
    .single();

  const presidentName = settings?.signature_president_name || "Ing. Christian Caicedo Plúa, PhD";
  const coordinatorName = settings?.signature_coordinator_name || "Ing. Javier Marcillo Merino, Mg";

  // Reset text color to black for signatures
  doc.setTextColor(0, 0, 0);
  
  // Left signature line
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(30, finalY, 90, finalY);
  
  // Left signature - Name (Bold)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(presidentName, 60, finalY + 6, { align: "center" });
  
  // Left signature - Title (Regular, wrapped)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const titleLeft = "Coordinador de la Carrera de Tecnologías de la Información";
  const splitTitleLeft = doc.splitTextToSize(titleLeft, 70);
  doc.text(splitTitleLeft, 60, finalY + 12, { align: "center" });
  
  // Right signature line
  doc.line(120, finalY, 180, finalY);
  
  // Right signature - Name (Bold)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(coordinatorName, 150, finalY + 6, { align: "center" });
  
  // Right signature - Title (Regular, wrapped)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const titleRight = "Coordinador del Grupo de investigación GISICF Carrera de Tecnologías de la Información";
  const splitTitleRight = doc.splitTextToSize(titleRight, 70);
  doc.text(splitTitleRight, 150, finalY + 12, { align: "center" });

  // Save with proper filename
  doc.save(`Planificacion_${plan.period_name.replace(/\s+/g, "_")}.pdf`);
}
