import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPDFHeader } from "./pdfHeaderUtils";

interface EvaluationItem {
  category: string;
  indicator_name: string;
  score_obtained: number | null;
}

interface EvaluationData {
  year: number;
  total_score: number;
  status: string;
  items: EvaluationItem[];
  userName: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  A: "Publicación Científica",
  B: "Transferencia de Tecnología",
  C: "Recursos Económicos",
  D: "Impactos",
};

const CATEGORY_MAX_SCORES: Record<string, number> = {
  A: 45,
  B: 10,
  C: 15,
  D: 30,
};

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
  doc.text("E-mail: grupo.gisicf@unesum.edu.ec", pageWidth / 2, footerY, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Complejo Deportivo – UNESUM – Km. 1 vía Noboa", pageWidth / 2, footerY + 4, { align: "center" });
}

function drawWatermark(doc: jsPDF, status: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.saveGraphicsState();
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  
  const watermarkText = status === 'draft' ? 'BORRADOR' : status === 'submitted' ? 'ENVIADO' : '';
  
  if (watermarkText) {
    doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
  }
  
  doc.restoreGraphicsState();
}

export async function generateEvaluationPDF(data: EvaluationData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw institutional header
  let y = await drawPDFHeader(doc);
  y += 8;

  // Draw watermark
  drawWatermark(doc, data.status);

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(218, 238, 243);
  doc.rect(14, y - 4, pageWidth - 28, 10, "F");
  doc.text("INFORME DE EVALUACIÓN ANUAL", pageWidth / 2, y + 2, { align: "center" });

  y += 12;

  // User and Year info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Investigador: ${data.userName}`, 14, y);
  y += 6;
  doc.text(`Año de Evaluación: ${data.year}`, 14, y);
  y += 6;
  doc.text(`Puntuación Total: ${data.total_score}/100 pts`, 14, y);
  y += 10;

  // Summary table by category
  const tableData = Object.entries(CATEGORY_NAMES).map(([category, name]) => {
    const categoryItems = data.items.filter((item) => item.category === category);
    const score = categoryItems.reduce((sum, item) => sum + (item.score_obtained || 0), 0);
    const maxScore = CATEGORY_MAX_SCORES[category];
    const percentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : "0.0";
    
    return [
      name,
      `${score.toFixed(1)}`,
      `${maxScore}`,
      `${percentage}%`,
    ];
  });

  // Add total row
  tableData.push([
    "TOTAL",
    `${data.total_score.toFixed(1)}`,
    "100",
    `${data.total_score.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Categoría", "Puntos Obtenidos", "Puntos Máximos", "Porcentaje"]],
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
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
    },
    didDrawPage: () => {
      drawPageFooter(doc);
    },
  });

  // Detailed breakdown by category
  let finalY = (doc as any).lastAutoTable.finalY + 10;

  Object.entries(CATEGORY_NAMES).forEach(([category, categoryName]) => {
    const categoryItems = data.items.filter((item) => item.category === category);
    
    if (categoryItems.length > 0) {
      // Check if we need a new page (need space for content + signatures + footer)
      if (finalY > 230) {
        doc.addPage();
        drawPageFooter(doc);
        finalY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${categoryName}:`, 14, finalY);
      finalY += 6;

      const detailData = categoryItems.map((item) => [
        item.indicator_name,
        `${(item.score_obtained || 0).toFixed(1)} pts`,
      ]);

      autoTable(doc, {
        startY: finalY,
        body: detailData,
        theme: "plain",
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 140 },
          1: { cellWidth: 40, halign: "right" },
        },
      });

      finalY = (doc as any).lastAutoTable.finalY + 8;
    }
  });

  // Status note - ensure it doesn't overlap with footer
  const statusText = data.status === 'draft' 
    ? 'Este documento es un borrador y no tiene validez oficial hasta su envío.'
    : data.status === 'submitted'
    ? 'Este documento ha sido enviado y está en proceso de revisión.'
    : data.status === 'approved'
    ? 'Este documento ha sido aprobado por la coordinación.'
    : '';

  if (statusText) {
    const pageHeight2 = doc.internal.pageSize.getHeight();
    if (finalY > pageHeight2 - 30) {
      doc.addPage();
      drawPageFooter(doc);
      finalY = 20;
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(statusText, 14, finalY);
  }

  // Save PDF
  doc.save(`Evaluacion_${data.year}_${data.userName.replace(/\s+/g, "_")}.pdf`);
}
