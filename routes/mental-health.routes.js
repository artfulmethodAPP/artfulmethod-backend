const express = require("express");
const { analyzeText } = require("../controller/mental-health.controller");
const authenticate = require("../middlewares/authenticate.middleware");

const router = express.Router();

// Claude API can take up to 60s — extend timeout beyond Cloudflare's 100s limit
const extendTimeout = (req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
};

/**
 * @swagger
 * tags:
 *   name: MentalHealth
 *   description: Mental health speech analysis via Claude AI
 */

/**
 * @swagger
 * /api/v1/mental-health/analyze:
 *   post:
 *     summary: Analyze transcribed speech for mental health signals
 *     tags: [MentalHealth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Transcribed speech text to analyze
 *                 example: "I've been feeling really anxious lately and can't sleep well."
 * 
 *     responses:
 *       200:
 *         description: Analysis result from Claude AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: string
 *                       description: Claude's mental health analysis
 *                     usage:
 *                       type: object
 *                       properties:
 *                         input_tokens:
 *                           type: integer
 *                         output_tokens:
 *                           type: integer
 *       400:
 *         description: Missing text 
 *       500:
 *         description: Claude API not configured or upstream error
 */
router.post("/analyze", authenticate ,extendTimeout, analyzeText);

module.exports = router;
