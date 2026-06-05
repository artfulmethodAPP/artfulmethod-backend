"use strict";

const path = require("path");
const PDFDocument = require("pdfkit");
const { randomUUID } = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3.config");
const { getPresignedUrl } = require("./s3.service");

// ─── Palette: simple white background, black text ────────────────────────────
const COLOURS = {
  black: "#1A1A1A",
  text: "#333333",
  muted: "#8A8A8A",
  hairline: "#E8E8E8",
  accent: "#C0894B", // warm neutral accent rule under headings
  quoteBar: "#D9C3A6", // soft accent for the quote left border
  white: "#FFFFFF",
};

// ─── Layout constants ────────────────────────────────────────────────────────
const MARGIN = 56;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN;

// ─── Assets ──────────────────────────────────────────────────────────────────
const LOGO_PATH = path.join(__dirname, "..", "assets", "am-logo.jpg");
const FONTS = {
  regular: path.join(__dirname, "..", "fonts", "Montserrat-Regular.ttf"),
  medium: path.join(__dirname, "..", "fonts", "Montserrat-Medium.ttf"),
  semibold: path.join(__dirname, "..", "fonts", "Montserrat-SemiBold.ttf"),
  bold: path.join(__dirname, "..", "fonts", "Montserrat-Bold.ttf"),
};

// Font aliases registered on each document.
const F = { regular: "M-Regular", medium: "M-Medium", semibold: "M-SemiBold", bold: "M-Bold" };

const registerFonts = (doc) => {
  doc.registerFont(F.regular, FONTS.regular);
  doc.registerFont(F.medium, FONTS.medium);
  doc.registerFont(F.semibold, FONTS.semibold);
  doc.registerFont(F.bold, FONTS.bold);
};

// White background on every page.
const paintBackground = (doc) => {
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOURS.white);
  doc.restore();
  doc.fillColor(COLOURS.text);
};

// Ensure there is room for `needed` points; add a page only when the current one
// is genuinely full. Never pre-emptively creates trailing blank pages.
const ensureSpace = (doc, needed) => {
  if (doc.y + needed > BOTTOM_LIMIT) {
    doc.addPage();
  }
};

// Centered logo. Returns the y position just below it.
const drawLogo = (doc, y, width = 84) => {
  try {
    const x = (PAGE_WIDTH - width) / 2;
    // Logo is 263x366 (portrait); keep aspect ratio by fitting width.
    doc.image(LOGO_PATH, x, y, { width });
    // Approximate rendered height from the known aspect ratio.
    const height = width * (366 / 263);
    return y + height;
  } catch (e) {
    // If the logo asset is missing, fall back to a wordmark so no blank gap.
    doc
      .font(F.bold)
      .fontSize(20)
      .fillColor(COLOURS.black)
      .text("ARTFUL METHOD", MARGIN, y, {
        width: CONTENT_WIDTH,
        align: "center",
        characterSpacing: 2,
      });
    return y + 28;
  }
};

const hairline = (doc, y) => {
  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_WIDTH - MARGIN, y)
    .strokeColor(COLOURS.hairline)
    .lineWidth(1)
    .stroke();
};

// ─── Cover page ───────────────────────────────────────────────────────────────
const drawCover = (doc, archetype, participant, meta) => {
  doc.addPage();

  const logoBottom = drawLogo(doc, 110, 96);

  let y = logoBottom + 36;

  doc
    .font(F.medium)
    .fontSize(10)
    .fillColor(COLOURS.muted)
    .text("ARTFUL METHOD", MARGIN, y, {
      width: CONTENT_WIDTH,
      align: "center",
      characterSpacing: 3,
    });

  y = doc.y + 14;
  doc
    .font(F.bold)
    .fontSize(26)
    .fillColor(COLOURS.black)
    .text(archetype.name, MARGIN, y, { width: CONTENT_WIDTH, align: "center" });

  if (archetype.subtitle) {
    doc
      .font(F.regular)
      .fontSize(13)
      .fillColor(COLOURS.muted)
      .text(archetype.subtitle, MARGIN, doc.y + 6, {
        width: CONTENT_WIDTH,
        align: "center",
      });
  }

  // Full-width divider under the title block, with room above and below.
  const dividerY = doc.y + 26;
  hairline(doc, dividerY);

  // ── Cover headers: meta lines + participant + date (Section I) ──────────────
  // Sits as its own centered block, well clear of the divider above.
  const name = participant?.name;
  const date = participant?.date;
  const metaLines = (meta || []).filter((m) => m && m.trim());

  if (metaLines.length || name || date) {
    doc.y = dividerY + 30; // divider + comfortable gap

    // Context lines, e.g. "Session: The Story Arc", "Artwork: Apollo and Daphne"
    metaLines.forEach((line) => {
      doc
        .font(F.regular)
        .fontSize(10.5)
        .fillColor(COLOURS.muted)
        .text(line, MARGIN, doc.y, { width: CONTENT_WIDTH, align: "center" });
      doc.y += 4;
    });
    if (metaLines.length) doc.y += 10;

    if (name) {
      doc
        .font(F.medium)
        .fontSize(12)
        .fillColor(COLOURS.text)
        .text(`Prepared for ${name}`, MARGIN, doc.y, {
          width: CONTENT_WIDTH,
          align: "center",
        });
      doc.y += 8;
    }
    if (date) {
      doc
        .font(F.regular)
        .fontSize(10)
        .fillColor(COLOURS.muted)
        .text(date, MARGIN, doc.y, {
          width: CONTENT_WIDTH,
          align: "center",
          characterSpacing: 0.5,
        });
    }
  }
};

// Format a date as e.g. "5 June 2026".
const formatReportDate = (d) => {
  const dt = d instanceof Date ? d : new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
};

// ─── Typographic building blocks (minimal + accent rule) ─────────────────────

// Small uppercase eyebrow label, e.g. "SESSION 1" or a sub-label.
const drawEyebrow = (doc, text) => {
  doc
    .font(F.semibold)
    .fontSize(8.5)
    .fillColor(COLOURS.muted)
    .text(text.toUpperCase(), MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      characterSpacing: 1.8,
    });
  doc.moveDown(0.25);
};

// Major section heading: bold title with a short accent rule beneath it.
const drawSectionHeading = (doc, text) => {
  ensureSpace(doc, 72);
  doc.moveDown(0.4);
  doc
    .font(F.bold)
    .fontSize(15)
    .fillColor(COLOURS.black)
    .text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  // short accent rule
  const ry = doc.y + 5;
  doc
    .moveTo(MARGIN, ry)
    .lineTo(MARGIN + 34, ry)
    .strokeColor(COLOURS.accent)
    .lineWidth(2)
    .stroke();
  doc.y = ry + 10;
};

// Sub-heading (e.g. "Your Range: Artist") — lighter than a section heading.
const drawSubHeading = (doc, text) => {
  ensureSpace(doc, 54);
  doc.moveDown(0.3);
  doc
    .font(F.semibold)
    .fontSize(12)
    .fillColor(COLOURS.black)
    .text(text, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
};

const drawBody = (doc, text, gapAfter = 1.0) => {
  doc
    .font(F.regular)
    .fontSize(10.5)
    .fillColor(COLOURS.text)
    .text(text, MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 4.5,
      paragraphGap: 8,
    });
  doc.moveDown(gapAfter);
};

// Quote set off with a left accent bar and indent.
const drawQuote = (doc, quote) => {
  ensureSpace(doc, 56);
  const startY = doc.y;
  const indent = 16;
  doc
    .font(F.medium)
    .fontSize(11.5)
    .fillColor(COLOURS.black)
    .text(`“${quote}”`, MARGIN + indent, startY, {
      width: CONTENT_WIDTH - indent,
      lineGap: 3,
    });
  // Left bar spanning the quote height
  doc
    .moveTo(MARGIN, startY + 1)
    .lineTo(MARGIN, doc.y - 2)
    .strokeColor(COLOURS.quoteBar)
    .lineWidth(2.5)
    .stroke();
  doc.moveDown(0.5);
};

// ─── Quotes block (Type 1: What You Said and What It Reveals) ─────────────────
const drawQuotes = (doc, quotesAndMeanings) => {
  drawSectionHeading(doc, "What You Said and What It Reveals");

  quotesAndMeanings.forEach((item, idx) => {
    ensureSpace(doc, 96);
    drawQuote(doc, item.quote);

    const meaning = item.meaning ?? item.vts_commentary ?? "";
    if (meaning) {
      doc
        .font(F.regular)
        .fontSize(10.5)
        .fillColor(COLOURS.text)
        .text(meaning, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 4.5 });
    }

    if (idx < quotesAndMeanings.length - 1) {
      doc.moveDown(0.9);
      hairline(doc, doc.y);
      doc.moveDown(0.9);
    } else {
      doc.moveDown(0.6);
    }
  });
};

// ─── Teaser cards (Type 1) ────────────────────────────────────────────────────
// Detect a GiR "Session N: Dominant Archetype: X" heading and render it as an
// eyebrow ("SESSION N") + bold archetype name, instead of one flat bold line.
const SESSION_HEADING_RE = /^Session\s+(\d+):\s*Dominant Archetype:\s*(.+)$/i;

// One archetype entry inside the grouped "Your Range" list: an accent dot, the
// archetype name in bold, then its paragraph.
const drawRangeItem = (doc, mode, body) => {
  ensureSpace(doc, 56);
  doc.moveDown(0.5);
  const y = doc.y;
  // accent dot
  doc.circle(MARGIN + 3, y + 5, 2.5).fill(COLOURS.accent);
  doc
    .font(F.semibold)
    .fontSize(11.5)
    .fillColor(COLOURS.black)
    .text(mode, MARGIN + 16, y, { width: CONTENT_WIDTH - 16 });
  doc.moveDown(0.3);
  if (body) {
    doc
      .font(F.regular)
      .fontSize(10.5)
      .fillColor(COLOURS.text)
      .text(body, MARGIN + 16, doc.y, { width: CONTENT_WIDTH - 16, lineGap: 4.5 });
  }
};

// ─── Report sections (intro + typed headings/bodies) ─────────────────────────
// When `skipIntro` is true the caller has already rendered report.intro (so the
// fixed intro can appear above the quotes block, per the Report Type 1 spec).
const drawReportSections = (doc, report, { skipIntro = false } = {}) => {
  if (!skipIntro && report.intro && report.intro.trim()) {
    drawBody(doc, report.intro, 1.2);
  }

  const sections = report.sections || [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const heading = section.heading || "";
    const sessionMatch = heading.match(SESSION_HEADING_RE);

    if (sessionMatch) {
      // Evidence block: eyebrow + archetype name, then quote + reflection.
      ensureSpace(doc, 90);
      doc.moveDown(0.3);
      drawEyebrow(doc, `Session ${sessionMatch[1]}`);
      doc
        .font(F.bold)
        .fontSize(13)
        .fillColor(COLOURS.black)
        .text(sessionMatch[2].trim(), MARGIN, doc.y, { width: CONTENT_WIDTH });
      doc.moveDown(0.45);

      // section.body for evidence is `"quote"\n\nreflection`
      const body = section.body || "";
      const m = body.match(/^\s*["“”](.+?)["“”]\s*\n+([\s\S]*)$/);
      if (m) {
        drawQuote(doc, m[1].trim());
        drawBody(doc, m[2].trim(), 0.9);
      } else {
        drawBody(doc, body, 0.9);
      }
      continue;
    }

    // Group consecutive "Your Range: X" sections under a single heading + list.
    if (/^Your Range:/i.test(heading)) {
      drawSectionHeading(doc, "Your Range");
      while (i < sections.length && /^Your Range:/i.test(sections[i].heading || "")) {
        const mode = sections[i].heading.replace(/^Your Range:\s*/i, "").trim();
        drawRangeItem(doc, mode, sections[i].body || "");
        i++;
      }
      i--; // step back so the for-loop's i++ lands on the next section
      doc.moveDown(0.6);
      continue;
    }

    // Everything else → major section heading + body.
    if (heading) drawSectionHeading(doc, heading);
    if (section.body) drawBody(doc, section.body);
  }
};

// ─── Footer wordmark on the last content page (no separate blank back cover) ──
const drawClosing = (doc) => {
  ensureSpace(doc, 70);
  doc.moveDown(1.0);
  hairline(doc, doc.y);
  doc.moveDown(0.8);
  doc
    .font(F.semibold)
    .fontSize(11)
    .fillColor(COLOURS.black)
    .text("ARTFUL METHOD", MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
      characterSpacing: 2,
    });
  doc
    .font(F.regular)
    .fontSize(9)
    .fillColor(COLOURS.muted)
    .text(`Aesthetic Intelligence · ${new Date().getFullYear()}`, MARGIN, doc.y + 4, {
      width: CONTENT_WIDTH,
      align: "center",
    });
};

// ─── Main: build PDF buffer ───────────────────────────────────────────────────

/**
 * Generates a white/black, Montserrat, logo-branded PDF and returns a Buffer.
 * Content flows continuously so there are no trailing blank pages.
 * @param {{ archetype, teaserCards, quotesAndMeanings, report, participant }} result
 *        participant: { name?: string, date?: string|Date } shown on the cover page.
 * @returns {Promise<Buffer>}
 */
const generateReportPdf = (result) => {
  return new Promise((resolve, reject) => {
    const { archetype, teaserCards, quotesAndMeanings, report, participant, meta } = result;

    // Participant details for the cover (Section I). Date defaults to today.
    const cover = {
      name: participant?.name || null,
      date: formatReportDate(participant?.date),
    };

    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      autoFirstPage: false,
      info: {
        Title: `Artful Method Report: ${archetype?.name ?? ""}`.trim(),
        Author: "Artful Method",
      },
    });

    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    registerFonts(doc);

    // Paint white background on every page as it is added.
    doc.on("pageAdded", () => paintBackground(doc));

    // Cover (adds the first page).
    drawCover(doc, archetype || {}, cover, meta);

    // Body: continue on a fresh page so the cover stays clean.
    doc.addPage();

    // Report Type 1 structure: the fixed intro paragraph leads the body, before
    // "What You Said and What It Reveals". The onboarding teaser cards
    // ("Your Perceptual Signature") are intentionally not rendered in the PDF.
    if (report && report.intro && report.intro.trim()) {
      drawBody(doc, report.intro, 1.2);
    }
    if (quotesAndMeanings && quotesAndMeanings.length) {
      drawQuotes(doc, quotesAndMeanings);
    }
    if (report && ((report.sections && report.sections.length) || report.intro)) {
      drawReportSections(doc, report, { skipIntro: true });
    }

    drawClosing(doc);

    doc.end();
  });
};

// ─── Upload PDF buffer to S3 ──────────────────────────────────────────────────

/**
 * Uploads a PDF Buffer to S3 and returns the permanent S3 key (not a URL).
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>} S3 key e.g. "reports/uuid.pdf"
 */
const uploadReportPdfToS3 = async (pdfBuffer) => {
  const key = `reports/${randomUUID()}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    }),
  );
  return key;
};

module.exports = { generateReportPdf, uploadReportPdfToS3 };
