// frontend/src/components/compare/ConstructorPdfComparisonCard.tsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getTeamColor } from "../../lib/teamColors";
import { getTeamLogo } from "../../lib/teamAssets";
import { loadImageAsDataURL } from "../../lib/pdfUtils";

interface ConstructorPdfData {
  id: string;
  name: string;
  nationality: string;
  isActive: boolean;
  teamColor: string;
}

interface ConstructorStats {
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  points: number;
  dnfs: number;
  races: number;
}

interface ConstructorComparisonData {
  constructor1: ConstructorPdfData;
  constructor2: ConstructorPdfData;
  stats1: ConstructorStats;
  stats2: ConstructorStats;
  enabledMetrics: Record<string, boolean>;
  score: { c1: number | null; c2: number | null };
}

export const ConstructorPdfComparisonCard = async (data: ConstructorComparisonData) => {
  const { constructor1, constructor2, stats1, stats2, enabledMetrics, score } = data;
  
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors & theme
  const text = "#111827";
  const subtle = "#6b7280";
  const border = "#e5e7eb";
  const railW = 6;

  const c1Color = getTeamColor(constructor1.name) || "#0ea5e9";
  const c2Color = getTeamColor(constructor2.name) || "#ef4444";

  // Safe text helper (no unsupported glyphs)
  const TXT = (t: string, x: number, y: number, opts: { size?: number; color?: string; align?: "left" | "center" | "right"; bold?: boolean } = {}) => {
    const { size = 11, color = text, align = "left", bold = false } = opts;
    doc.setTextColor(color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const xPos = align === "center" ? x : align === "right" ? x : x;
    doc.text(t, xPos, y, { align });
  };

  const rectF = (x: number, y: number, w: number, h: number, fill: string) => {
    doc.setFillColor(fill);
    doc.rect(x, y, w, h, "F");
  };

  // Header band
  rectF(0, 0, pageWidth, 26, "#0f172a");
  TXT("Constructor Comparison", 10, 16, { size: 16, color: "#ffffff", bold: true });
  TXT("RaceIQ Analytics", pageWidth - 70, 12, { size: 10, color: "#cbd5e1", align: "left" });
  TXT(new Date().toLocaleDateString(), pageWidth - 70, 19, { size: 10, color: "#cbd5e1", align: "left" });

  // Side rails (team accents)
  rectF(0, 26, railW, pageHeight - 26, c1Color);
  rectF(pageWidth - railW, 26, railW, pageHeight - 26, c2Color);

  // Card layout
  const marginX = 16;
  const topY = 34;
  const cardW = (pageWidth - marginX * 2 - 20) / 2; // space for center VS
  const gap = 20;

  // Load team logos (PNG data URLs)
  const c1LogoUrl = getTeamLogo(constructor1.name);
  const c2LogoUrl = getTeamLogo(constructor2.name);
  
  let c1Logo = null;
  let c2Logo = null;
  
  if (c1LogoUrl) {
    const logoData = await loadImageAsDataURL(c1LogoUrl);
    c1Logo = logoData || null;
  }
  
  if (c2LogoUrl) {
    const logoData = await loadImageAsDataURL(c2LogoUrl);
    c2Logo = logoData || null;
  }

  // Team cards: headers
  const leftX = marginX;
  const rightX = marginX + cardW + gap;

  const headerH = 34;

  // Left header
  rectF(leftX, topY, cardW, headerH, "#f8fafc");
  doc.setDrawColor(border);
  doc.rect(leftX, topY, cardW, headerH); // border
  
  if (c1Logo) {
    doc.addImage(c1Logo, "PNG", leftX + 8, topY + 6, 22, 22);
  } else {
    // Fallback: colored circle with initials
    doc.setFillColor(c1Color);
    doc.circle(leftX + 19, topY + 17, 11, "F");
    const initials = constructor1.name.split(' ').map(word => word[0]).join('').substring(0, 2);
    TXT(initials, leftX + 19, topY + 20, { size: 8, color: "#ffffff", bold: true, align: "center" });
  }
  
  TXT(constructor1.name, leftX + 36, topY + 16, { size: 14, bold: true });
  TXT(constructor1.nationality, leftX + 36, topY + 26, { size: 10, color: subtle });
  // team underline
  rectF(leftX, topY + headerH - 3, cardW, 3, c1Color);

  // Right header
  rectF(rightX, topY, cardW, headerH, "#f8fafc");
  doc.rect(rightX, topY, cardW, headerH);
  
  if (c2Logo) {
    doc.addImage(c2Logo, "PNG", rightX + 8, topY + 6, 22, 22);
  } else {
    // Fallback: colored circle with initials
    doc.setFillColor(c2Color);
    doc.circle(rightX + 19, topY + 17, 11, "F");
    const initials = constructor2.name.split(' ').map(word => word[0]).join('').substring(0, 2);
    TXT(initials, rightX + 19, topY + 20, { size: 8, color: "#ffffff", bold: true, align: "center" });
  }
  
  TXT(constructor2.name, rightX + 36, topY + 16, { size: 14, bold: true });
  TXT(constructor2.nationality, rightX + 36, topY + 26, { size: 10, color: subtle });
  rectF(rightX, topY + headerH - 3, cardW, 3, c2Color);

  // Center VS coin
  const centerX = marginX + cardW + gap / 2;
  doc.setDrawColor(border);
  doc.setFillColor("#f1f5f9");
  doc.circle(centerX, topY + headerH / 2, 10, "FD");
  TXT("VS", centerX, topY + headerH / 2 + 4, { size: 11, bold: true, align: "center", color: "#0f172a" });

  // Metrics table with autoTable
  const normalizeKey = (k: string) => {
    if (k === "dnf") return "dnfs";
    if (k === "fastest_laps") return "fastestLaps";
    return k;
  };

  const enabledRaw = Object.keys(enabledMetrics).filter((k) => enabledMetrics[k]);
  const enabled = Array.from(new Set(enabledRaw.map(normalizeKey)));

  // Map labels & keys (use dnfs consistently)
  const labelMap: Record<string, string> = {
    wins: "Wins",
    podiums: "Podiums",
    poles: "Pole Positions",
    fastestLaps: "Fastest Laps",
    points: "Points",
    races: "Races",
    dnfs: "DNFs",
  };

  const keyMap: Record<string, keyof ConstructorStats> = {
    wins: "wins",
    podiums: "podiums",
    poles: "poles",
    fastestLaps: "fastestLaps",
    points: "points",
    races: "races",
    dnfs: "dnfs",
  };

  // Build table rows
  const rows = enabled.map((k) => {
    const key = keyMap[k];
    const label = labelMap[k] || k;
    const v1 = (stats1 as any)[key] ?? 0;
    const v2 = (stats2 as any)[key] ?? 0;
    return [label, String(v1), "", String(v2)];
  });

  const tableY = topY + headerH + 6;
  const tableWidth = 134; // Total width for centered table
  const tableStartX = (pageWidth - tableWidth) / 2; // Center the table
  
  autoTable(doc, {
    startY: tableY,
    margin: { left: tableStartX, right: pageWidth - (tableStartX + tableWidth) },
    theme: "grid",
    head: [[`${constructor1.name}`, "", "", `${constructor2.name}`]],
    body: rows,
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: "#111827",
      lineColor: border,
      lineWidth: 0.2,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: "#e2e8f0",
      textColor: "#0f172a",
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 60, halign: "left", fontStyle: "bold" },
      1: { cellWidth: 30, halign: "right", textColor: c1Color },
      2: { cellWidth: 28, halign: "center" }, // indicator bar cell
      3: { cellWidth: 30, halign: "left", textColor: c2Color },
    },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 2) return;

      const row = data.row.index;
      const metric = enabled[row];
      const key = keyMap[metric];
      const v1 = (stats1 as any)[key] ?? 0;
      const v2 = (stats2 as any)[key] ?? 0;

      const { x, y, width, height } = data.cell;
      const pad = 2;
      const bx = x + pad, by = y + pad, bw = width - pad * 2, bh = height - pad * 2;

      // background
      doc.setFillColor(245, 247, 250);
      doc.rect(bx, by, bw, bh, "F");

      const total = Math.max(v1 + v2, 1);
      const leftW = (v1 / total) * bw;
      const rightW = bw - leftW;

      // Left (team 1)
      // Solid if winner, light if loser or equal
      const c1Wins = v1 > v2;
      const c2Wins = v2 > v1;

      const [r1, g1, b1] = hexToRgb(c1Color);
      const [r2, g2, b2] = hexToRgb(c2Color);

      // left segment
      doc.setFillColor(r1, g1, b1, c1Wins ? 1 : 0.25);
      doc.rect(bx, by, leftW, bh, "F");

      // right segment
      doc.setFillColor(r2, g2, b2, c2Wins ? 1 : 0.25);
      doc.rect(bx + leftW, by, rightW, bh, "F");

      // center divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(bx + leftW, by, bx + leftW, by + bh);

      // equal tick (if tie)
      if (v1 === v2) {
        const cx = bx + bw / 2;
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.4);
        doc.line(cx - 2, by + bh / 2, cx + 2, by + bh / 2);
      }
    },
  });

  function hexToRgb(hex: string) {
    const m = hex.replace("#", "");
    return [parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16)];
  }


  // Centered composite score section
  const compositeTitle = "Composite Score";
  const center = pageWidth / 2;
  const maxBarW = Math.min(220, pageWidth - marginX * 2 - 20);
  const barW = maxBarW;
  const barH = 10;
  const scoreTop = (doc as any).lastAutoTable ? ((doc as any).lastAutoTable.finalY + 16) : (tableY + 90);

  // Title centered
  TXT(compositeTitle, center, scoreTop, { size: 13, bold: true, align: "center" });

  // Bar centered
  const barX = center - barW / 2;
  const barY = scoreTop + 6;

  // background
  doc.setFillColor(241, 245, 249);
  doc.rect(barX, barY, barW, barH, "F");

  if (score.c1 != null && score.c2 != null) {
    const total = Math.max(score.c1 + score.c2, 1);
    const c1W = (score.c1 / total) * barW;
    const c2W = barW - c1W;

    // fills
    const [r1, g1, b1] = hexToRgb(c1Color);
    const [r2, g2, b2] = hexToRgb(c2Color);
    doc.setFillColor(r1, g1, b1);
    doc.rect(barX, barY, c1W, barH, "F");
    doc.setFillColor(r2, g2, b2);
    doc.rect(barX + c1W, barY, c2W, barH, "F");

    // outline
    doc.setDrawColor(border);
    doc.rect(barX, barY, barW, barH);

    // End labels below the bar ends
    const labelsY = barY + 16;
    TXT(`${constructor1.name}: ${score.c1}`, barX, labelsY, { size: 10, color: subtle, align: "left" });
    TXT(`${constructor2.name}: ${score.c2}`, barX + barW, labelsY, { size: 10, color: subtle, align: "right" });

    // Centered winner ribbon
    const winner = score.c1 > score.c2 ? constructor1 : constructor2;
    const wColor = score.c1 > score.c2 ? c1Color : c2Color;
    const ribbonW = 70;
    const ribbonH = 16;
    const ribbonX = center - ribbonW / 2;
    const ribbonY = labelsY + 6;

    // ribbon
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(border);
    doc.roundedRect(ribbonX, ribbonY, ribbonW, ribbonH, 2, 2, "FD");

    // top stripe
    const [wr, wg, wb] = hexToRgb(wColor);
    doc.setFillColor(wr, wg, wb);
    doc.rect(ribbonX, ribbonY, ribbonW, 3, "F");

    TXT(`WINNER: ${winner.name}`, center, ribbonY + 11, { size: 9, bold: true, align: "center" });
  }
  
  // Centered footer
  const footY = pageHeight - 10;
  const footText = "Generated by RaceIQ • raceiq.com";
  doc.setDrawColor(border);
  doc.line(marginX, footY - 6, pageWidth - marginX, footY - 6);
  TXT(footText, center, footY, { size: 9, color: subtle, align: "center" });

  const fileName = `constructor-comparison-${constructor1.name.replace(/\s+/g, "-")}-vs-${constructor2.name.replace(/\s+/g, "-")}.pdf`;
  doc.save(fileName);
};