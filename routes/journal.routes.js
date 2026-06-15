"use strict";

const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const { listEntries, getEntry } = require("../controller/journal.controller");

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

module.exports = router;
