import jsPDF from "jspdf";

// Logos paths
const LOGO_UNESUM = "/logos/logo_unesum.png";
const LOGO_CARRERA = "/logos/logo_carrera_unesum.png";
const LOGO_GISICF = "/src/assets/gisicf-logo.png";

export interface ManualCoverData {
  title: string;
  subtitle: string;
  version: string;
  date: string;
  documentType: "manual_usuario" | "manual_admin" | "ficha_tecnica";
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function drawManualCover(doc: jsPDF, data: ManualCoverData): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient effect (light blue)
  doc.setFillColor(240, 248, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top decorative bar
  doc.setFillColor(31, 78, 121);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Bottom decorative bar
  doc.setFillColor(31, 78, 121);
  doc.rect(0, pageHeight - 40, pageWidth, 40, "F");

  let y = 45;

  // Load and draw logos
  try {
    // UNESUM Logo - Left
    const logoUnesum = await loadImage(LOGO_UNESUM);
    doc.addImage(logoUnesum, "PNG", 25, y, 40, 40);

    // Carrera Logo - Right
    const logoCarrera = await loadImage(LOGO_CARRERA);
    doc.addImage(logoCarrera, "PNG", pageWidth - 65, y, 40, 40);
  } catch (error) {
    console.error("Error loading header logos:", error);
  }

  y = 100;

  // Institution name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(31, 78, 121);
  doc.text("UNIVERSIDAD ESTATAL DEL SUR DE MANABÍ", pageWidth / 2, y, { align: "center" });

  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Facultad de Ciencias Técnicas", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.text("Carrera de Tecnologías de la Información", pageWidth / 2, y, { align: "center" });

  y += 20;

  // GISICF Logo - Center (larger)
  try {
    const logoGisicf = await loadImage(LOGO_GISICF);
    const logoWidth = 60;
    const logoHeight = 60;
    doc.addImage(logoGisicf, "PNG", (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
    y += logoHeight + 15;
  } catch (error) {
    console.error("Error loading GISICF logo:", error);
    y += 20;
  }

  // Decorative line
  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(2);
  doc.line(40, y, pageWidth - 40, y);

  y += 15;

  // Document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(31, 78, 121);
  
  // Split title if too long
  const titleLines = doc.splitTextToSize(data.title, pageWidth - 60);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 12;
  });

  y += 5;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  const subtitleLines = doc.splitTextToSize(data.subtitle, pageWidth - 60);
  subtitleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 7;
  });

  y += 10;

  // Decorative line
  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(1);
  doc.line(60, y, pageWidth - 60, y);

  y += 15;

  // Platform name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 78, 121);
  doc.text("Plataforma GISICF", pageWidth / 2, y, { align: "center" });

  y += 8;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("Gestión de Investigación Científica y Formativa", pageWidth / 2, y, { align: "center" });

  // Version and date at bottom
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Versión ${data.version}`, pageWidth / 2, pageHeight - 25, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.date, pageWidth / 2, pageHeight - 15, { align: "center" });

  return y;
}

export function drawManualPageHeader(doc: jsPDF, title: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(31, 78, 121);
  doc.rect(0, 0, pageWidth, 20, "F");

  // Title in header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, 13, { align: "center" });

  // Logo placeholder
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("GISICF", 15, 13);

  return 30;
}

export function drawManualPageFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Footer line
  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

  // Page number
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: "center" });

  // Footer text
  doc.setFontSize(8);
  doc.text("UNESUM - Grupo de Investigación GISICF", pageWidth / 2, pageHeight - 6, { align: "center" });
}

export function addSectionTitle(doc: jsPDF, title: string, y: number, sectionNumber?: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Section background
  doc.setFillColor(218, 238, 243);
  doc.rect(14, y - 5, pageWidth - 28, 12, "F");

  // Section number and title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 78, 121);
  
  const text = sectionNumber ? `${sectionNumber}. ${title}` : title;
  doc.text(text, 20, y + 3);

  return y + 18;
}

export function addSubsectionTitle(doc: jsPDF, title: string, y: number, subsectionNumber?: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 78, 121);
  
  const text = subsectionNumber ? `${subsectionNumber} ${title}` : title;
  doc.text(text, 20, y);

  // Underline
  const textWidth = doc.getTextWidth(text);
  doc.setDrawColor(31, 78, 121);
  doc.setLineWidth(0.3);
  doc.line(20, y + 1, 20 + textWidth, y + 1);

  return y + 10;
}

export function addParagraph(doc: jsPDF, text: string, y: number, indent: number = 20): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - indent - 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }
    doc.text(line, indent, y);
    y += 5;
  });

  return y + 3;
}

export function addBulletList(doc: jsPDF, items: string[], y: number, indent: number = 25): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - indent - 25;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  items.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }
    
    // Bullet point
    doc.setFillColor(31, 78, 121);
    doc.circle(indent - 4, y - 1.5, 1.5, "F");

    const lines = doc.splitTextToSize(item, maxWidth);
    lines.forEach((line: string, idx: number) => {
      doc.text(line, indent, y);
      y += 5;
    });
    y += 2;
  });

  return y + 3;
}

export function addNumberedList(doc: jsPDF, items: string[], y: number, indent: number = 25): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - indent - 25;

  items.forEach((item, index) => {
    if (y > 270) {
      doc.addPage();
      y = 30;
    }

    // Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 78, 121);
    doc.text(`${index + 1}.`, indent - 8, y);

    // Text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const lines = doc.splitTextToSize(item, maxWidth);
    lines.forEach((line: string) => {
      doc.text(line, indent, y);
      y += 5;
    });
    y += 3;
  });

  return y + 3;
}

export function addInfoBox(doc: jsPDF, title: string, content: string, y: number, type: "info" | "warning" | "tip" = "info"): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 40;

  // Box colors based on type
  const colors = {
    info: { bg: [230, 244, 255], border: [31, 78, 121], icon: "ℹ️" },
    warning: { bg: [255, 243, 224], border: [255, 152, 0], icon: "⚠️" },
    tip: { bg: [232, 245, 233], border: [76, 175, 80], icon: "💡" },
  };

  const color = colors[type];

  // Background
  doc.setFillColor(color.bg[0], color.bg[1], color.bg[2]);
  doc.setDrawColor(color.border[0], color.border[1], color.border[2]);
  doc.setLineWidth(0.5);

  const lines = doc.splitTextToSize(content, boxWidth - 20);
  const boxHeight = 15 + lines.length * 5;

  doc.roundedRect(20, y, boxWidth, boxHeight, 3, 3, "FD");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(color.border[0], color.border[1], color.border[2]);
  doc.text(`${title}`, 25, y + 8);

  // Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  let contentY = y + 16;
  lines.forEach((line: string) => {
    doc.text(line, 25, contentY);
    contentY += 5;
  });

  return y + boxHeight + 8;
}
