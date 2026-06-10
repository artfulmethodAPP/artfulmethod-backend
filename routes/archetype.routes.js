const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const iconUploadS3 = require("../middlewares/icon-upload-s3.middleware");
const { analyzeTranscript } = require("../controller/archetype.controller");
const {
  createArchetype,
  getAllArchetypes,
  getArchetype,
  updateArchetype,
  deleteArchetype,
  getReportUrl,
  getMyReport,
} = require("../controller/archetypes.controller");
const {
  createArchetypeSchema,
  updateArchetypeSchema,
  archetypeParamsSchema,
} = require("../validations/archetype.validation");

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
 *   description: Aesthetic Archetype management and analysis
 */

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/archetype:
 *   post:
 *     summary: Create a new archetype (admin only)
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *                 description: Hex or CSS color value (e.g. #C9A84C)
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Icon image — uploaded to S3; url stored in icon_url
 *     responses:
 *       201:
 *         description: Archetype created
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authenticate,
  isAdmin,
  iconUploadS3.single("icon"),
  validate(createArchetypeSchema),
  createArchetype,
);

/**
 * @swagger
 * /api/v1/archetype:
 *   get:
 *     summary: List all archetypes
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of archetypes
 */
router.get("/", authenticate, getAllArchetypes);

// Literal "/report" must be registered BEFORE "/:id" so it is not captured as
// an archetype id (otherwise "report" is parsed as the :id param → NaN).
router.get("/report", authenticate, getMyReport);

/**
 * @swagger
 * /api/v1/archetype/{id}:
 *   get:
 *     summary: Get a single archetype by id
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archetype record
 *       404:
 *         description: Not found
 */
router.get(
  "/:id",
  authenticate,
  validate(archetypeParamsSchema, "params"),
  getArchetype,
);

/**
 * @swagger
 * /api/v1/archetype/{id}:
 *   put:
 *     summary: Update an archetype (admin only)
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Archetype updated
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  authenticate,
  isAdmin,
  validate(archetypeParamsSchema, "params"),
  iconUploadS3.single("icon"),
  validate(updateArchetypeSchema),
  updateArchetype,
);

router.patch(
  "/:id",
  authenticate,
  isAdmin,
  validate(archetypeParamsSchema, "params"),
  iconUploadS3.single("icon"),
  validate(updateArchetypeSchema),
  updateArchetype,
);

/**
 * @swagger
 * /api/v1/archetype/{id}:
 *   delete:
 *     summary: Delete an archetype (admin only)
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Archetype deleted
 *       404:
 *         description: Not found
 */
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validate(archetypeParamsSchema, "params"),
  deleteArchetype,
);

// ─── Analysis ─────────────────────────────────────────────────────────────────

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
 *       400:
 *         description: transcript field missing or empty
 *       500:
 *         description: Claude API error
 */
router.post("/analyze", authenticate, extendTimeout, analyzeTranscript);

/**
 * @swagger
 * /api/v1/archetype/report/{id}:
 *   get:
 *     summary: Get archetype report URL by id
 *     description: Returns the generated report URL for a specific archetype analysis/report.
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Report or archetype analysis ID
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Report URL fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: https://example.com/reports/12.pdf
 *       400:
 *         description: Invalid report ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/archetype/report:
 *   get:
 *     summary: Get my onboarding archetype report (JSON)
 *     description: Returns the logged-in user's latest onboarding archetype assessment report (the stored report_json from Ai_Reports).
 *     tags: [Archetype]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archetype report retrieved successfully
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
 *                   example: "Archetype report retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     report_id:
 *                       type: integer
 *                       example: 12
 *                     report:
 *                       $ref: '#/components/schemas/ArchetypeResult'
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No archetype report found
 */
// NOTE: the literal "/report" route is registered earlier (before "/:id") so it
// is not shadowed by the archetype-by-id route. See above the GET "/:id" route.

router.get("/report/:id", authenticate, getReportUrl);

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
 *         report:
 *           type: object
 *           description: Full portrait report data for Screen 8
 *           properties:
 *             intro:
 *               type: string
 *             sections:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   heading:
 *                     type: string
 *                   body:
 *                     type: string
 *             raw:
 *               type: string
 *         quotesAndMeanings:
 *           type: array
 *           description: 4 quotes from transcript with VTS meaning blocks
 *           items:
 *             type: object
 *             properties:
 *               quote:
 *                 type: string
 *               meaning:
 *                 type: string
 */

module.exports = router;
