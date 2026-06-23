import jsPDF from "jspdf";
import type { Song } from "@/types/songs";
import { buildShareUrl, BRAND_NAME } from "@/lib/share";

/** Build a clean plain-text version of a song for sharing / clipboard / .txt download. */
export function songToPlainText(song: Song): string {
  const lines: string[] = [];
  lines.push(`Song ${song.number} — ${song.title}`);
  lines.push("");

  let verseCount = 0;
  for (const section of song.sections) {
    if (section.type === "chorus") {
      lines.push(section.label ?? "CHORUS");
    } else {
      verseCount += 1;
      lines.push(section.label ?? `VERSE ${verseCount}`);
    }
    for (const ln of section.lines) lines.push(ln);
    lines.push("");
  }

  lines.push(`Shared via ${BRAND_NAME} – ${buildShareUrl(`/songs?song=${song.number}`)}`);
  return lines.join("\n").trim() + "\n";
}

/** Generate a nicely typeset PDF of the song and trigger a download. */
export function downloadSongPdf(song: Song): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56; // 0.78"
  const marginTop = 64;
  const marginBottom = 56;
  const contentWidth = pageWidth - marginX * 2;

  let y = marginTop;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  // Song number pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(90, 110, 200);
  doc.text(`SONG ${song.number}`, marginX, y);
  y += 16;

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 20);
  const titleLines = doc.splitTextToSize(song.title, contentWidth);
  for (const line of titleLines) {
    ensureSpace(30);
    doc.text(line, marginX, y);
    y += 30;
  }

  // Divider
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 22;

  let verseCount = 0;
  for (const section of song.sections) {
    const isChorus = section.type === "chorus";
    let label: string;
    if (isChorus) {
      label = section.label ?? "CHORUS";
    } else {
      verseCount += 1;
      label = section.label ?? `VERSE ${verseCount}`;
    }

    ensureSpace(32);

    // Section label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(isChorus ? 60 : 120, isChorus ? 90 : 120, isChorus ? 200 : 130);
    doc.text(label.toUpperCase(), marginX, y);
    y += 14;

    // Lyrics
    doc.setFont(isChorus ? "times" : "times", isChorus ? "italic" : "normal");
    doc.setFontSize(12);
    doc.setTextColor(25, 25, 25);

    const indent = isChorus ? 14 : 0;
    for (const rawLine of section.lines) {
      const wrapped = doc.splitTextToSize(rawLine, contentWidth - indent);
      for (const wl of wrapped) {
        ensureSpace(16);
        doc.text(wl, marginX + indent, y);
        y += 16;
      }
    }

    // Left chorus bar
    if (isChorus) {
      const barTop = y - section.lines.length * 16 - 14;
      const barBottom = y - 4;
      doc.setDrawColor(80, 110, 220);
      doc.setLineWidth(2);
      doc.line(marginX - 6, barTop, marginX - 6, barBottom);
    }

    y += 12;
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);
    const footer = `${BRAND_NAME} • ${buildShareUrl(`/songs?song=${song.number}`)} • Page ${i} of ${pageCount}`;
    doc.text(footer, pageWidth / 2, pageHeight - 24, { align: "center" });
  }

  const fileName = `Song-${song.number}-${song.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.pdf`;
  doc.save(fileName);
}
