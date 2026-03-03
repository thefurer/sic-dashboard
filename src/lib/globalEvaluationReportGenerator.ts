import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPDFHeader } from "./pdfHeaderUtils";
import { supabase } from "@/integrations/supabase/client";

interface ApprovedReport {
  id: string;
  user_id: string;
  year: number;
  total_score: number;
  status: string;
  reviewed_at: string | null;
  admin_observations?: string | null;
  profiles?: {
    full_name: string;
  };
}

export async function generateGlobalEvaluationReport(
  reports: ApprovedReport[],
  year: number
) {
  // Fetch signature settings from database
  const { data: settings } = await supabase
    .from("app_settings")
    .select("signature_president_name, signature_coordinator_name, signature_responsible_name")
    .single();

  // Order: 1. Coordinador Grupo GISICF, 2. Responsable Comisión, 3. Coordinador Carrera
  const coordinadorGrupoName = settings?.signature_coordinator_name || "Ing. Christian Caicedo Plúa, PhD";
  const responsableComisionName = settings?.signature_responsible_name || "Ing. Karina Mero, MSc";
  const coordinadorCarreraName = settings?.signature_president_name || "Ing. Javier Marcillo Merino, Mg";
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw institutional header
  let y = await drawPDFHeader(doc);
  y += 8;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(218, 238, 243);
  doc.rect(14, y - 4, pageWidth - 28, 10, "F");
  doc.text(
    `INFORME GENERAL DE EVALUACIÓN DE INVESTIGACIÓN ${year}`,
    pageWidth / 2,
    y + 2,
    { align: "center" }
  );

  y += 15;

  // Summary stats
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const completedCount = reports.filter(r => r.status === 'approved').length;
  const incompleteCount = reports.length - completedCount;
  
  doc.text(
    `Total de Evaluaciones: ${reports.length} (Completas: ${completedCount}, Incompletas: ${incompleteCount})`,
    14,
    y
  );
  y += 10;

  // Main table with all researchers
  const tableData = reports
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    .map((report, index) => {
      const isApproved = report.status === 'approved';
      const hasObservations = report.admin_observations && report.admin_observations.trim() !== '';
      
      // Determine estado based on status
      const estado = isApproved ? 'Completo' : 'Incompleto';
      
      // Calculate puntuación: 100/100 if approved, 0/100 if incomplete or has observations
      const puntuacion = isApproved ? '100/100' : '0/100';
      
      // Get observations or show "Sin observaciones"
      const observaciones = hasObservations 
        ? (report.admin_observations!.length > 50 
            ? report.admin_observations!.substring(0, 50) + '...' 
            : report.admin_observations!)
        : 'Sin observaciones';
      
      return [
        (index + 1).toString(),
        report.profiles?.full_name || "Sin nombre",
        puntuacion,
        estado,
        observaciones,
        report.reviewed_at
          ? new Date(report.reviewed_at).toLocaleDateString("es-ES")
          : "N/A",
      ];
    });

  autoTable(doc, {
    startY: y,
    head: [["N°", "Investigador", "Puntuación", "Estado", "Observaciones", "Fecha Revisión"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [218, 238, 243],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { halign: "left", cellWidth: 40 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "left", cellWidth: 55 },
      5: { halign: "center", cellWidth: 28 },
    },
    didDrawPage: (data) => {
      drawPageFooter(doc);
    },
  });

  // Signature section - ensure enough space before footer
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Check if we need a new page for signatures (need 80mm for signatures + footer)
  if (finalY > pageHeight - 80) {
    doc.addPage();
    drawPageFooter(doc);
  }

  const sigY = finalY > pageHeight - 80 ? 40 : finalY;
  const colWidth = (pageWidth - 28) / 3;

  // Three signatures in order: Coordinador Grupo, Responsable Comisión, Coordinador Carrera
  const signatures = [
    { title: "Coordinador del Grupo de Investigación GISICF", name: coordinadorGrupoName },
    { title: "Responsable Comisión de Investigación", name: responsableComisionName },
    { title: "Coordinador de la Carrera de TI", name: coordinadorCarreraName },
  ];

  signatures.forEach((sig, index) => {
    const xPos = 14 + colWidth * index + colWidth / 2;

    // Signature line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(xPos - 30, sigY, xPos + 30, sigY);

    // Name - more spacing
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const nameLines = doc.splitTextToSize(sig.name, 55);
    doc.text(nameLines, xPos, sigY + 6, { align: "center" });

    // Title - more spacing and better line height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const titleLines = doc.splitTextToSize(sig.title, 55);
    const nameHeight = nameLines.length * 5;
    doc.text(titleLines, xPos, sigY + 6 + nameHeight + 2, {
      align: "center",
    });
  });

  // Save PDF
  doc.save(`Informe_General_Evaluaciones_${year}.pdf`);
}

function drawPageFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - 20;

  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(0.8);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  doc.setTextColor(31, 78, 121);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(
    "E-mail: grupo.gisicf@unesum.edu.ec",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Complejo Deportivo – UNESUM – Km. 1 vía Noboa",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );
}
