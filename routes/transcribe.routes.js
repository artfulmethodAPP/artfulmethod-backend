const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const validate = require("../middlewares/validate");
const { saveTranscript, transcribeAudio, getAudioUrl } = require("../controller/transcribe.controller");
const { saveTranscriptSchema } = require("../validations/transcribe.validation");
const audioUpload = require("../middlewares/audio-upload.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transcribe
 *   description: Audio transcript storage
 */

// POST /transcribe/audio — transcribes + uploads to S3 → creates DB record → returns { transcription: { text, ... }, transcript_id: 5 }
// User reviews/edits the text on screen
// POST /transcribe/save with { transcript_id: 5, text: "edited text" } → updates that record's transcript_text


/**
 * @swagger
 * /api/v1/transcribe/save:
 *   patch:
 *     summary: Save or update a transcript
 *     description: |
 *       Two flows:
 *       - **Audio flow** — provide `transcript_id` (returned by `POST /audio`) to update the existing record with the user's edited text.
 *       - **Typing flow** — omit `transcript_id` to create a new text-only transcript record (no audio file).
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
 *             properties:
 *               transcript_id:
 *                 type: integer
 *                 description: ID of an existing transcript to update (audio flow only)
 *                 example: 10
 *               text:
 *                 type: string
 *                 description: Transcript text (required, max 50000 characters)
 *                 example: "Lorem ipsum dolor sit amet"
 *               duration:
 *                 type: number
 *                 description: Recording duration in seconds (typing flow only)
 *                 example: 180
 *               language:
 *                 type: string
 *                 description: Language code (typing flow only, 2–20 chars)
 *                 example: "en-US"
 *               wordCount:
 *                 type: integer
 *                 description: Word count override (computed automatically if omitted)
 *                 example: 390
 *     responses:
 *       201:
 *         description: Transcript saved or updated successfully
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
 *                   example: "Transcript saved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transcript:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transcript not found (when transcript_id is provided but does not exist)
 */
router.patch("/save", authenticate, validate(saveTranscriptSchema), saveTranscript);

/**
 * @swagger
 * /api/v1/transcribe/audio:
 *   post:
 *     summary: Transcribe audio via ElevenLabs and upload to S3 (runs in parallel)
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

/**
 * @swagger
 * /api/v1/transcribe/audio/{id}:
 *   get:
 *     summary: Get a presigned URL for a stored audio file
 *     tags: [Transcribe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The transcript ID whose audio file URL you want to retrieve
 *         example: 10
 *     responses:
 *       200:
 *         description: Presigned audio URL generated successfully (valid for 1 hour)
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
 *                   example: "Audio URL generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     audio_url:
 *                       type: string
 *                       example: "https://s3.amazonaws.com/bucket/audio/uuid.mp3?X-Amz-Signature=..."
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transcript not found or audio file not available
 */
router.get("/audio/:id", authenticate, getAudioUrl);

module.exports = router;
