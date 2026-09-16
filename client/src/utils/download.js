import { jsPDF } from "jspdf";

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Turns a content type like "Blog Post" into "blog-post-2026-07-25". */
export function buildBaseFilename(type) {
  const slug = type.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `${slug || "generated-content"}-${date}`;
}

export function downloadTxt(text, baseFilename) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  triggerDownload(blob, `${baseFilename}.txt`);
}

export function downloadPdf(text, baseFilename) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  const fontSize = 11;
  const lineHeight = fontSize * 1.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  let y = margin;
  const paragraphs = text.split(/\n+/);

  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim() === "") return;

    const lines = doc.splitTextToSize(paragraph, maxWidth);
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
    if (index < paragraphs.length - 1) y += lineHeight * 0.5;
  });

  doc.save(`${baseFilename}.pdf`);
}
