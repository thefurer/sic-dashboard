import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPDFHeader } from "./pdfHeaderUtils";

interface ApprovedReport {
  id: string;
  user_id: string;
  year: number;
  total_score: number;
  status: string;
  reviewed_at: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export async function generateGlobalEvaluationReport(
  reports: ApprovedReport[],
  year: number
) {
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
  doc.text(
    `Total de Evaluaciones Aprobadas: ${reports.length}`,
    14,
    y
  );
  y += 6;

  const averageScore =
    reports.length > 0
      ? (
          reports.reduce((sum, r) => sum + (r.total_score || 0), 0) /
          reports.length
        ).toFixed(2)
      : "0.00";
  doc.text(`Puntuación Promedio: ${averageScore}/100 pts`, 14, y);
  y += 10;

  // Main table with all approved researchers
  const tableData = reports
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    .map((report, index) => [
      (index + 1).toString(),
      report.profiles?.full_name || "Sin nombre",
      `${(report.total_score || 0).toFixed(1)}/100`,
      report.reviewed_at
        ? new Date(report.reviewed_at).toLocaleDateString("es-ES")
        : "N/A",
    ]);

  autoTable(doc, {
    startY: y,
    head: [["N°", "Investigador", "Puntuación Total", "Fecha Aprobación"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [218, 238, 243],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 35 },
      3: { halign: "center", cellWidth: 35 },
    },
    didDrawPage: (data) => {
      drawPageFooter(doc);
    },
  });

  // Signature section
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Check if we need a new page for signatures
  if (finalY > pageHeight - 60) {
    doc.addPage();
    drawPageFooter(doc);
  }

  const sigY = finalY > pageHeight - 60 ? 40 : finalY;
  const colWidth = (pageWidth - 28) / 3;

  // Three signatures: President, Responsible, Coordinator
  const signatures = [
    { title: "Presidente", name: "Ing. Christian Caicedo Plúa, PhD" },
    {
      title: "Responsable Comisión de Investigación",
      name: "Ing. María González, MSc",
    },
    { title: "Coordinador", name: "Ing. Javier Marcillo Merino, Mg" },
  ];

  signatures.forEach((sig, index) => {
    const xPos = 14 + colWidth * index + colWidth / 2;

    // Signature line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(xPos - 30, sigY, xPos + 30, sigY);

    // Name
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const nameLines = doc.splitTextToSize(sig.name, 70);
    doc.text(nameLines, xPos, sigY + 5, { align: "center" });

    // Title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const titleLines = doc.splitTextToSize(sig.title, 70);
    doc.text(titleLines, xPos, sigY + 5 + nameLines.length * 4, {
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
    "E-mail: ingenieria.ti@unesum.edu.ec",
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
