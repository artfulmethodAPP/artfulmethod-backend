const express = require("express");
const { analyzeTranscript } = require("../controller/archetype.controller");
const authenticate = require("../middlewares/authenticate.middleware");

const router = express.Router();

// Claude runs 3 prompts (1 sequential + 2 parallel) — extend timeout
const extendTimeout = (req, res, next) => {
  req.setTimeout(180000);
  res.setTimeout(180000);
  next();
};

/**
 * @swagger
 * tags:
 *   name: Archetype
 *   description: Aesthetic Archetype analysis from transcript text
 */

/**
 * @swagger
 * /api/v1/archetype/analyze:
 *   post:
 *     summary: Analyze a (user-reviewed) transcript and return archetype + teaser cards + full report
 *     description: |
 *       Full flow:
 *       1. User records audio and gets transcript via `/transcribe/audio`
 *       2. User reviews and edits the transcript on the frontend
 *       3. Frontend sends the final transcript to this endpoint
 *       4. Returns archetype name (Screen 2), 4 teaser card lines (Screens 3-6), and full portrait report (Screen 8)
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript
 *             properties:
 *               transcript:
 *                 type: string
 *                 description: The final (user-reviewed) session transcript text
 *                 example: "Immediately, I love all the colors. It reminds me of Cuba somehow, maybe because of the old cars."
 *     responses:
 *       200:
 *         description: Full archetype analysis result
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
 *                   example: Archetype analysis completed successfully
 *                 data:
 *                   $ref: '#/components/schemas/ArchetypeResult'
 *       400:
 *         description: transcript field missing or empty
 *       500:
 *         description: Claude API error
 */
router.post("/analyze", authenticate, extendTimeout, analyzeTranscript);

/**
 * @swagger
 * components:
 *   schemas:
 *     ArchetypeResult:
 *       type: object
 *       properties:
 *         archetype:
 *           type: object
 *           description: Detected archetype — drives all subsequent screens
 *           properties:
 *             name:
 *               type: string
 *               enum: [Storyteller, Framer, Archivist, Artist, Integrator]
 *               example: Integrator
 *             subtitle:
 *               type: string
 *               example: Reflective Synthesiser
 *             isShortTranscript:
 *               type: boolean
 *               description: True if transcript was under 50 words — result may be less reliable
 *               example: false
 *         teaserCards:
 *           type: array
 *           description: 4 short lines for reveal cards (Screens 3–6). Feed as teaserCards[0]…[3].
 *           items:
 *             type: string
 *           example:
 *             - "You make meaning by seeing connections others miss and bringing different ideas together."
 *             - "You naturally notice how emotion, logic, and perspective interact within a bigger whole."
 *             - "Where others may separate ideas, you instinctively look for how they fit together."
 *             - "Your gift lies in seeing complexity clearly — and learning when to simplify it for others."
 *         report:
 *           type: object
 *           description: Full portrait report data for Screen 8
 *           properties:
 *             intro:
 *               type: string
 *               description: Fixed intro paragraph — always the same, never changes
 *             sections:
 *               type: array
 *               description: Parsed report sections — use heading as section title, body as content
 *               items:
 *                 type: object
 *                 properties:
 *                   heading:
 *                     type: string
 *                     example: What shapes this thinking
 *                   body:
 *                     type: string
 *                     example: You hold the whole thing at once...
 *             raw:
 *               type: string
 *               description: Full report as a single string (fallback if section parsing is not needed)
 *         quotesAndMeanings:
 *           type: array
 *           description: 4 quotes from transcript with VTS meaning blocks (Screen 9 — "What You Said and What It Reveals")
 *           items:
 *             type: object
 *             properties:
 *               quote:
 *                 type: string
 *                 example: "Immediately, I love all the colors."
 *               meaning:
 *                 type: string
 *                 example: "Your first move was sensory and affective. Before anything else, the image registered as a feeling..."
 */

module.exports = router;
