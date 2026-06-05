"use strict";

// ─── Report Preview (TEST ONLY, no auth) ─────────────────────────────────────
//
// Generates a Growth in Range (Report Type 3) PDF from dummy data so the report
// template can be eyeballed without running Claude or touching S3.
//
//   GET /api/v1/report-preview/gir        → streams the PDF inline in the browser
//   GET /api/v1/report-preview/gir?save=1 → also writes it to ./tmp/ and returns the path
//   GET /api/v1/report-preview/gir.json   → returns the dummy report JSON (structure check)
//
// REMOVE before production. Not wired to auth on purpose.

const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateReportPdf } = require("../services/pdf.service");

const router = express.Router();

// Dummy Growth in Range result, shaped exactly like analyzeGrowthInRange() output.
const DUMMY_GIR = {
  home_base: "Storyteller",
  range_modes: ["Framer", "Artist", "Archivist"],
  absent_modes: ["Integrator"],
  mode_counts: { Storyteller: 5, Framer: 2, Archivist: 1, Artist: 2, Integrator: 0 },
  report: {
    fixed_intro:
      "This portrait emerges from your own words. Over the course of our sessions, we recorded and transcribed how you thought out loud in front of ten works of art. Each image came with its own set of thinking prompts, designed to draw out different ways of looking and making meaning. What stayed the same was you. This is your Growth in Range portrait. What follows is not a fixed identity and it is not a score. It is a map of how many of the five perceptual modes you drew on across ten encounters with progressively more challenging images: which modes appear to be home for you, which others became available, and which did not appear in this sequence. We did not assign this. We found it in your own words, across ten separate encounters, over time.",
    overview:
      "Across ten encounters with progressively more challenging images, four of the five perceptual modes appeared in your language. Your home base appears to be the Storyteller: this is the mode you returned to most consistently, and the one that seems to anchor how you first enter an image. Alongside it, the Framer, the Artist, the Archivist each appeared at least once across the sequence, showing up in response to specific images and prompts that seemed to call them forward. The Integrator did not appear across these ten transcripts.",
    how_you_see:
      "You hold the image as a living scene. Personal memories, emotions, and idiosyncratic associations arrive before analysis.",
    evidence: [
      {
        session_number: 1,
        dominant_archetype: "Storyteller",
        quote: "It looks like she is about to leave and never come back.",
        reflection:
          "You're constructing a narrative from the gesture. The reading seems to enter the scene through story, giving the figure an intention and a future.",
      },
      {
        session_number: 4,
        dominant_archetype: "Framer",
        quote: "The way the lines lead to the corner makes it feel deliberate.",
        reflection:
          "You're grounding your idea in what you see. Your attention appears to move toward how the composition is built before naming what it means.",
      },
      {
        session_number: 7,
        dominant_archetype: "Artist",
        quote: "There is something heavy and quiet in the whole thing.",
        reflection:
          "You're sensing an emotional tone. The mood seems to arrive ahead of explanation, and you appear to stay with it rather than resolve it.",
      },
      {
        session_number: 9,
        dominant_archetype: "Archivist",
        quote: "This reminds me of those old Dutch winter scenes.",
        reflection:
          "You're linking this to a tradition. The work seems to be placed within a wider history of similar images you have encountered.",
      },
    ],
    quotes_and_meanings: [],
    your_range: [
      {
        mode: "Storyteller",
        paragraph:
          "As a home base, the Storyteller appears to be where meaning-making begins for you. You tend to enter an image through the people in it and the events that might surround them.",
      },
      {
        mode: "Framer",
        paragraph:
          "The Framer became available when the composition itself seemed to ask for attention. You could shift toward structure and evidence when a work rewarded it.",
      },
      {
        mode: "Artist",
        paragraph:
          "The Artist surfaced in images that carried a strong atmosphere. You appeared willing to stay inside a feeling without rushing to explain it.",
      },
      {
        mode: "Archivist",
        paragraph:
          "The Archivist appeared more briefly, often as a passing reference to other works, before your attention returned to narrative paths.",
      },
    ],
    emerging_perceptual_capacities:
      "Analysis of your transcripts suggests a dynamic relationship between your home base (The Storyteller: Narrative Maker) and your emergent capacities. Your language could pivot from reading human interactions (The Storyteller: Narrative Maker) into tracking structural and stylistic variations (The Framer: Structure Seeker). You could also transition into an affective space, matching tone and color with interior atmosphere (The Artist: Emotional Explorer). Historical cues and authorship tracking (The Archivist: Context Builder) functioned as accessible entry markers.",
    absent_modes_sentence:
      "The Integrator mode did not appear in this sequence.",
    how_might_this_show_up:
      "Beyond the art room, this range might show up in how you make sense of new situations. You may begin with the human story, then test it against what is actually in front of you, and stay open to the feeling a moment carries.",
    home_base_archetype_description:
      "You hold the image as a living scene. Personal memories, emotions, and idiosyncratic associations arrive before analysis.",
  },
};

// Build the same PDF payload that course.service uses for GiR reports.
const buildGirPdfPayload = (gir) => {
  const evidenceSections = (gir.report.evidence || []).map((e) => ({
    heading: `Session ${e.session_number ?? ""}: Dominant Archetype: ${e.dominant_archetype ?? ""}`.trim(),
    body: `"${e.quote}"\n\n${e.reflection}`,
  }));

  return {
    archetype: {
      name: `Growth in Range: ${gir.home_base}`,
      subtitle: `Home base: ${gir.home_base} · Range: ${gir.range_modes.join(", ") || "none"}`,
    },
    participant: { name: "Jane Smith" }, // sample for preview only
    teaserCards: [],
    quotesAndMeanings: [],
    report: {
      intro: gir.report.fixed_intro,
      sections: [
        { heading: "How You See", body: gir.report.overview },
        ...evidenceSections,
        ...gir.report.your_range.map((r) => ({
          heading: `Your Range: ${r.mode}`,
          body: r.paragraph,
        })),
        ...(gir.report.emerging_perceptual_capacities
          ? [{ heading: "Emerging Perceptual Capacities", body: gir.report.emerging_perceptual_capacities }]
          : []),
        { heading: "Absent Modes", body: gir.report.absent_modes_sentence },
        { heading: "How might this show up?", body: gir.report.how_might_this_show_up },
      ],
    },
  };
};

/**
 * @swagger
 * tags:
 *   name: Report Preview (TEST)
 *   description: Test-only endpoints to preview report templates with dummy data. No auth. Remove before production.
 */

/**
 * @swagger
 * /api/v1/report-preview/gir.json:
 *   get:
 *     summary: Dummy Growth in Range report JSON (TEST)
 *     description: Returns a Growth in Range (Report Type 3) payload built from dummy data, so the JSON structure can be checked without running Claude.
 *     tags: [Report Preview (TEST)]
 *     responses:
 *       200:
 *         description: Dummy report JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Dummy GiR report"
 *                 data:
 *                   type: object
 *                   description: Same shape as analyzeGrowthInRange() output (home_base, range_modes, absent_modes, mode_counts, report{...}).
 */
router.get("/gir.json", (req, res) => {
  res.json({ success: true, message: "Dummy GiR report", data: DUMMY_GIR });
});

/**
 * @swagger
 * /api/v1/report-preview/gir:
 *   get:
 *     summary: Dummy Growth in Range report PDF (TEST)
 *     description: |
 *       Generates a Growth in Range (Report Type 3) PDF from dummy data and streams it inline.
 *       Pass `?save=1` to also write the PDF to the server's local `./tmp/gir-preview.pdf` and
 *       return its path instead of streaming. No Claude call, no S3. Remove before production.
 *     tags: [Report Preview (TEST)]
 *     parameters:
 *       - in: query
 *         name: save
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["1"]
 *         description: If "1", writes the PDF to ./tmp/ and returns its local path as JSON.
 *     responses:
 *       200:
 *         description: PDF streamed inline, or (with save=1) JSON with the local file path.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "PDF written locally"
 *                 data:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                       example: "C:\\\\...\\\\tmp\\\\gir-preview.pdf"
 *                     bytes:
 *                       type: integer
 *                       example: 7490
 */
// PDF preview (streams inline; ?save=1 also writes to ./tmp/)
router.get("/gir", async (req, res, next) => {
  try {
    const pdfBuffer = await generateReportPdf(buildGirPdfPayload(DUMMY_GIR));

    if (req.query.save === "1") {
      const dir = path.join(process.cwd(), "tmp");
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, "gir-preview.pdf");
      fs.writeFileSync(filePath, pdfBuffer);
      return res.json({
        success: true,
        message: "PDF written locally",
        data: { path: filePath, bytes: pdfBuffer.length },
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="gir-preview.pdf"');
    return res.send(pdfBuffer);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
