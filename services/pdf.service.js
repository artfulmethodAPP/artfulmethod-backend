"use strict";

const PDFDocument = require("pdfkit");
const { randomUUID } = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3.config");

// ─── Colour palette ──────────────────────────────────────────────────────────
const COLOURS = {
  black: "#1A1A1A",
  white: "#FFFFFF",
  gold: "#C9A84C",
  goldLight: "#E8D5A3",
  darkBg: "#12100E",
  sectionBg: "#1E1C1A",
  mutedText: "#9E9E9E",
  divider: "#333333",
};

// ─── Layout constants ────────────────────────────────────────────────────────
const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const addPageBackground = (doc) => {
  doc.rect(0, 0, PAGE_WIDTH, doc.page.height).fill(COLOURS.darkBg);
};

const drawDivider = (doc, yOffset = 0) => {
  const y = doc.y + yOffset;
  doc
    .moveTo(MARGIN, y)
    .lineTo(PAGE_WIDTH - MARGIN, y)
    .strokeColor(COLOURS.divider)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.5);
};

const drawGoldAccent = (doc, x, y, width = 30) => {
  doc
    .moveTo(x, y)
    .lineTo(x + width, y)
    .strokeColor(COLOURS.gold)
    .lineWidth(2)
    .stroke();
};

// ─── Cover page ───────────────────────────────────────────────────────────────

const drawCoverPage = (doc, archetype) => {
  addPageBackground(doc);

  // Top decorative line
  doc
    .moveTo(MARGIN, 80)
    .lineTo(PAGE_WIDTH - MARGIN, 80)
    .strokeColor(COLOURS.gold)
    .lineWidth(1)
    .stroke();

  // App label
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLOURS.mutedText)
    .text("ARTFUL METHOD", MARGIN, 95, { characterSpacing: 3 });

  // Main title
  doc
    .font("Helvetica-Bold")
    .fontSize(34)
    .fillColor(COLOURS.white)
    .text("Aesthetic Archetype", MARGIN, 160, { lineGap: 4 })
    .text("Portrait Report", MARGIN);

  // Gold underline beneath title
  drawGoldAccent(doc, MARGIN, doc.y + 8, 80);
  doc.moveDown(2.5);

  // Archetype badge block
  const badgeY = doc.y;
  doc
    .rect(MARGIN, badgeY, CONTENT_WIDTH, 80)
    .fillColor(COLOURS.sectionBg)
    .fill();

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLOURS.gold)
    .text("YOUR PRIMARY ARCHETYPE", MARGIN + 20, badgeY + 18, {
      characterSpacing: 2,
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(COLOURS.white)
    .text(`${archetype.name}  ·  ${archetype.subtitle}`, MARGIN + 20, badgeY + 36);

  doc.y = badgeY + 80 + 30;

  // Intro label
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLOURS.gold)
    .text("ABOUT THIS REPORT", MARGIN, doc.y, { characterSpacing: 2 });

  doc.moveDown(0.6);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLOURS.goldLight)
    .text(
      "This portrait emerges from your own words, recorded and analysed during a live art-viewing session.",
      MARGIN,
      doc.y,
      { width: CONTENT_WIDTH, lineGap: 5 },
    );

  // Bottom decorative line
  doc
    .moveTo(MARGIN, doc.page.height - 60)
    .lineTo(PAGE_WIDTH - MARGIN, doc.page.height - 60)
    .strokeColor(COLOURS.gold)
    .lineWidth(1)
    .stroke();
};

// ─── Teaser cards page ────────────────────────────────────────────────────────

const drawTeaserPage = (doc, teaserCards) => {
  doc.addPage();
  addPageBackground(doc);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLOURS.gold)
    .text("YOUR PERCEPTUAL SIGNATURE", MARGIN, MARGIN + 10, {
      characterSpacing: 2,
    });

  doc.moveDown(0.8);
  drawGoldAccent(doc, MARGIN, doc.y, 40);
  doc.moveDown(1.2);

  teaserCards.forEach((line, idx) => {
    const cardY = doc.y;
    const cardHeight = 58;

    // Alternating card backgrounds for visual rhythm
    const bgColour = idx % 2 === 0 ? COLOURS.sectionBg : "#171513";
    doc.rect(MARGIN, cardY, CONTENT_WIDTH, cardHeight).fillColor(bgColour).fill();

    // Index dot
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(COLOURS.gold)
      .text(String(idx + 1).padStart(2, "0"), MARGIN + 14, cardY + 14);

    // Line text
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor(COLOURS.white)
      .text(line, MARGIN + 40, cardY + 14, {
        width: CONTENT_WIDTH - 60,
        lineGap: 4,
      });

    doc.y = cardY + cardHeight + 10;
  });
};

// ─── Quotes & meanings page(s) ───────────────────────────────────────────────

const drawQuotesPage = (doc, quotesAndMeanings) => {
  doc.addPage();
  addPageBackground(doc);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLOURS.gold)
    .text("WHAT YOU SAID AND WHAT IT REVEALS", MARGIN, MARGIN + 10, {
      characterSpacing: 2,
    });

  doc.moveDown(0.8);
  drawGoldAccent(doc, MARGIN, doc.y, 40);
  doc.moveDown(1.4);

  quotesAndMeanings.forEach((item, idx) => {
    // Check remaining space — start a new page if needed
    if (doc.y > doc.page.height - 160) {
      doc.addPage();
      addPageBackground(doc);
      doc.y = MARGIN + 20;
    }

    const blockStartY = doc.y;

    // Quote number label
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLOURS.gold)
      .text(`QUOTE ${idx + 1}`, MARGIN, blockStartY, { characterSpacing: 2 });

    doc.moveDown(0.4);

    // Gold left bar
    const quoteTextY = doc.y;
    doc
      .moveTo(MARGIN, quoteTextY)
      .lineTo(MARGIN, quoteTextY + 40)
      .strokeColor(COLOURS.gold)
      .lineWidth(2)
      .stroke();

    // Quote text
    doc
      .font("Helvetica-Oblique")
      .fontSize(13)
      .fillColor(COLOURS.white)
      .text(`"${item.quote}"`, MARGIN + 14, quoteTextY, {
        width: CONTENT_WIDTH - 14,
        lineGap: 5,
      });

    doc.moveDown(0.7);

    // Meaning label
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLOURS.mutedText)
      .text("MEANING", MARGIN, doc.y, { characterSpacing: 1.5 });

    doc.moveDown(0.35);

    // Meaning body
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLOURS.goldLight)
      .text(item.meaning, MARGIN, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: 4,
      });

    doc.moveDown(1.2);
    drawDivider(doc, 2);
    doc.moveDown(0.8);
  });
};

// ─── Full report section page(s) ─────────────────────────────────────────────

const drawReportPages = (doc, report) => {
  // Intro page
  doc.addPage();
  addPageBackground(doc);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLOURS.gold)
    .text("YOUR FULL PORTRAIT", MARGIN, MARGIN + 10, { characterSpacing: 2 });

  doc.moveDown(0.8);
  drawGoldAccent(doc, MARGIN, doc.y, 40);
  doc.moveDown(1.2);

  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLOURS.goldLight)
    .text(report.intro, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 6 });

  doc.moveDown(1.5);

  // Sections
  report.sections.forEach((section) => {
    // Page break guard — leave at least 100 pt for heading + first line
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
      addPageBackground(doc);
      doc.y = MARGIN + 20;
    }

    // Section heading
    const headingY = doc.y;
    drawGoldAccent(doc, MARGIN, headingY + 1, 20);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(COLOURS.gold)
      .text(section.heading, MARGIN + 26, headingY, { width: CONTENT_WIDTH - 26 });

    doc.moveDown(0.6);

    // Section body
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(COLOURS.white)
      .text(section.body, MARGIN, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: 5,
        paragraphGap: 6,
      });

    doc.moveDown(1.4);
  });
};

// ─── Back cover ───────────────────────────────────────────────────────────────

const drawBackCover = (doc) => {
  doc.addPage();
  addPageBackground(doc);

  // Centre vertically
  const midY = doc.page.height / 2 - 40;

  doc
    .moveTo(MARGIN, midY - 20)
    .lineTo(PAGE_WIDTH - MARGIN, midY - 20)
    .strokeColor(COLOURS.gold)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLOURS.white)
    .text("ARTFUL METHOD", MARGIN, midY, {
      width: CONTENT_WIDTH,
      align: "center",
      characterSpacing: 3,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLOURS.mutedText)
    .text("Aesthetic Intelligence", MARGIN, midY + 28, {
      width: CONTENT_WIDTH,
      align: "center",
    });

  doc
    .moveTo(MARGIN, midY + 52)
    .lineTo(PAGE_WIDTH - MARGIN, midY + 52)
    .strokeColor(COLOURS.gold)
    .lineWidth(0.5)
    .stroke();
};

// ─── Main: build PDF buffer ───────────────────────────────────────────────────

/**
 * Generates a PDF from the archetype analysis result and returns a Buffer.
 * @param {{ archetype, teaserCards, quotesAndMeanings, report }} result
 * @returns {Promise<Buffer>}
 */
const generateReportPdf = (result) => {
  return new Promise((resolve, reject) => {
    const { archetype, teaserCards, quotesAndMeanings, report } = result;

    const doc = new PDFDocument({
      size: "A4",
      margin: MARGIN,
      info: {
        Title: `Aesthetic Archetype Report — ${archetype.name}`,
        Author: "Artful Method",
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Page 1: Cover
    drawCoverPage(doc, archetype);

    // ── Page 2: Teaser cards
    if (teaserCards && teaserCards.length) {
      drawTeaserPage(doc, teaserCards);
    }

    // ── Page 3+: Quotes & meanings
    if (quotesAndMeanings && quotesAndMeanings.length) {
      drawQuotesPage(doc, quotesAndMeanings);
    }

    // ── Page N+: Full report
    if (report && report.sections && report.sections.length) {
      drawReportPages(doc, report);
    }

    // ── Back cover
    drawBackCover(doc);

    doc.end();
  });
};

// ─── Upload PDF buffer to S3 ──────────────────────────────────────────────────

/**
 * Uploads a PDF Buffer to S3 under reports/ and returns the public URL.
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>}
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

  return `${process.env.AWS_PREVIEW}/${key}`;
};

module.exports = { generateReportPdf, uploadReportPdfToS3 };
