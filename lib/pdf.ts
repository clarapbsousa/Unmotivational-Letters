'use client';

import { jsPDF } from 'jspdf';

export const generatePDF = async (
  content: string,
  companyName: string,
  personalInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  }
) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  });

  const margin = 25; // mm
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  // Helper to add a line of text
  const addLine = (text: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, margin, cursorY, { maxWidth: contentWidth });
    cursorY += 6;
  };

  // Personal info header
  addLine(personalInfo.name, true);
  if (personalInfo.address) addLine(personalInfo.address);
  if (personalInfo.phone) addLine(personalInfo.phone);
  if (personalInfo.email) addLine(personalInfo.email);
  cursorY += 6; // spacing before date
  addLine(date);
  cursorY += 12; // spacing before letter body

  // Body text with line wrapping
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const bodyLines = doc.splitTextToSize(content, contentWidth);
  bodyLines.forEach((line: string) => {
    // Soft page break if needed
    if (cursorY > pageHeight - margin - 20) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY, { maxWidth: contentWidth });
    cursorY += 6;
  });

  // Signature block
  cursorY += 12;
  if (cursorY > pageHeight - margin - 20) {
    doc.addPage();
    cursorY = margin;
  }

  // Save
  const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const safePersonName = personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filenameSuffix = safePersonName ? `${safeCompanyName}_${safePersonName}_MotivationalLetter.pdf` : `${safeCompanyName}_MotivationalLetter.pdf`;
  doc.save(filenameSuffix);
};
