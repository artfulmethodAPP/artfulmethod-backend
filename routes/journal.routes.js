"use strict";

const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const validate = require("../middlewares/validate");
const { listEntries, getEntry, updateEntry } = require("../controller/journal.controller");
const {
  entryIdParamSchema,
  updatePromptResponsesSchema,
} = require("../validations/journal.validation");

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/journal/entries:
 *   get:
 *     summary: Get all journal entries for the authenticated user
 *     description: |
 *       Returns all completed lesson sessions for the user.
 *       Each entry includes artwork details, artwork image URL, and all prompt responses (transcripts).
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Journal entries retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: UserLessonAttempt ID
 *                       course_id:
 *                         type: integer
 *                       lesson_id:
 *                         type: integer
 *                       lesson_title:
 *                         type: string
 *                       completed_at:
 *                         type: string
 *                         format: date-time
 *                       artwork_title:
 *                         type: string
 *                       artwork_info:
 *                         type: string
 *                       artwork_image_url:
 *                         type: string
 *                         description: Presigned S3 URL valid for 1 hour
 *                       prompt_responses:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             prompt_number:
 *                               type: integer
 *                             transcript_text:
 *                               type: string
 *                             submitted_at:
 *                               type: string
 *                               format: date-time
 */
router.get("/entries", listEntries);

/**
 * @swagger
 * /api/v1/journal/entries/{id}:
 *   get:
 *     summary: Get a single journal entry by ID
 *     description: Returns full artwork details and all prompt responses for one session.
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: UserLessonAttempt ID
 *     responses:
 *       200:
 *         description: Journal entry retrieved successfully
 *       404:
 *         description: Entry not found or does not belong to user
 */
router.get("/entries/:id", getEntry);

/**
 * @swagger
 * /api/v1/journal/entries/{id}:
 *   patch:
 *     summary: Update transcript text of a journal entry's prompt responses
 *     description: |
 *       Updates the transcript text for one or more prompt responses belonging to the
 *       entry. The entry must belong to the authenticated user, and every prompt
 *       response id must belong to that entry. Returns the refreshed entry.
 *     tags: [Journal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: UserLessonAttempt ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt_responses
 *             properties:
 *               prompt_responses:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - transcript_text
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: UserPromptResponse ID belonging to this entry
 *                       example: 12
 *                     transcript_text:
 *                       type: string
 *                       description: Updated transcript text (max 50000 characters)
 *                       example: "She stands by the open window, light pouring in."
 *     responses:
 *       200:
 *         description: Journal entry updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Entry or prompt response not found for this user
 */
router.patch(
  "/entries/:id",
  validate(entryIdParamSchema, "params"),
  validate(updatePromptResponsesSchema),
  updateEntry,
);

module.exports = router;
