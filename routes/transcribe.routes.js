const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const validate = require("../middlewares/validate");
const { saveTranscript, transcribeAudio } = require("../controller/transcribe.controller");
const { saveTranscriptSchema } = require("../validations/transcribe.validation");
const audioUpload = require("../middlewares/audio-upload.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transcribe
 *   description: Audio transcript storage
 */

/**
 * @swagger
 * /api/v1/transcribe/save:
 *   post:
 *     summary: Save an audio transcript
 *     tags: [Transcribe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - duration
 *               - language
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Lorem ipsum dolor sit amet"
 *               duration:
 *                 type: integer
 *                 example: 180
 *               language:
 *                 type: string
 *                 example: "en-US"
 *               wordCount:
 *                 type: integer
 *                 example: 390
 *     responses:
 *       201:
 *         description: Transcript saved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/save", authenticate, validate(saveTranscriptSchema), saveTranscript);

/**
 * @swagger
 * /api/v1/transcribe/audio:
 *   post:
 *     summary: Transcribe an audio file to text using ElevenLabs
 *     tags: [Transcribe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (mp3, wav, ogg, webm, m4a, aac, flac — max 25 MB)
 *     responses:
 *       200:
 *         description: Transcription result from ElevenLabs
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
 *                     transcription:
 *                       type: object
 *                       properties:
 *                         text:
 *                           type: string
 *                           example: "Hello, this is the transcribed text."
 *       400:
 *         description: Missing or invalid audio file
 *       401:
 *         description: Unauthorized
 */
router.post("/audio", authenticate, audioUpload.single("audio"), transcribeAudio);

module.exports = router;
