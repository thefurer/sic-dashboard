import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface HeaderSettings {
  institution_name: string;
  header_subtext: string;
  faculty_name: string;
  career_name: string;
  header_logo_left: string | null;
  header_logo_right: string | null;
  signature_president_name: string;
  signature_coordinator_name: string;
}

export async function fetchHeaderSettings(): Promise<HeaderSettings | null> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .single();

    if (error) throw error;
    return data as HeaderSettings;
  } catch (error) {
    console.error("Error fetching header settings:", error);
    return null;
  }
}

export async function drawPDFHeader(doc: jsPDF): Promise<number> {
  const settings = await fetchHeaderSettings();
  
  if (!settings) {
    // Draw minimal header if settings not available
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DOCUMENTO OFICIAL", doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });
    return 30;
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 10;

  // Load and draw logos
  try {
    if (settings.header_logo_left) {
      const leftLogoImg = await loadImage(settings.header_logo_left);
      doc.addImage(leftLogoImg, "PNG", 15, currentY, 25, 25);
    }
    
    if (settings.header_logo_right) {
      const rightLogoImg = await loadImage(settings.header_logo_right);
      doc.addImage(rightLogoImg, "PNG", pageWidth - 40, currentY, 25, 25);
    }
  } catch (error) {
    console.error("Error loading logos:", error);
  }

  // Institution name
  currentY = 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(settings.institution_name, pageWidth / 2, currentY, { align: "center" });

  // Header subtext
  currentY += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subtextLines = doc.splitTextToSize(settings.header_subtext, pageWidth - 60);
  subtextLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, currentY, { align: "center" });
    currentY += 4;
  });

  // Faculty name
  currentY += 1;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(settings.faculty_name, pageWidth / 2, currentY, { align: "center" });

  // Career name
  currentY += 5;
  doc.text(settings.career_name, pageWidth / 2, currentY, { align: "center" });

  // Draw separator line
  currentY += 5;
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  return currentY + 5;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
