"use strict";

const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const {
  getUsers,
  getUserDetail,
  getUserLessonReports,
  getUserTranscripts,
} = require("../controller/admin.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for managing and viewing all user data
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users (Admin)
 *     description: |
 *       Returns a paginated list of all users with summary stats.
 *       Supports search by name or email, and filtering by account status.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email (partial match)
 *         example: "john"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, deleted]
 *         description: Filter by account status. Omit to return all users.
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Jane Smith"
 *                           email:
 *                             type: string
 *                             example: "jane@example.com"
 *                           role:
 *                             type: string
 *                             enum: [user, admin]
 *                             example: "user"
 *                           is_verified:
 *                             type: boolean
 *                             example: true
 *                           streak_count:
 *                             type: integer
 *                             example: 5
 *                           last_activity_date:
 *                             type: string
 *                             format: date
 *                             example: "2026-05-19"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           deleted_at:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           home_base_course:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                                 example: "The Framer"
 *                           courses_completed:
 *                             type: integer
 *                             example: 1
 *                           lessons_completed:
 *                             type: integer
 *                             example: 4
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 42
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total_pages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.get("/users", authenticate, isAdmin, getUsers);

// ─── User Detail ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/users/{userId}:
 *   get:
 *     summary: Get user detail — profile, course progress, perception summary (Admin)
 *     description: |
 *       Returns the full profile, all course progress records (with total_lessons for
 *       progress bar), and an aggregated perception summary (archetype counts + mode labels).
 *       Course report JSON is included inline for completed courses.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         is_verified:
 *                           type: boolean
 *                         dob:
 *                           type: string
 *                           format: date
 *                           nullable: true
 *                         gender:
 *                           type: string
 *                           nullable: true
 *                         goal:
 *                           type: string
 *                           nullable: true
 *                         art_frequency:
 *                           type: string
 *                           nullable: true
 *                         source:
 *                           type: string
 *                           nullable: true
 *                         streak_count:
 *                           type: integer
 *                         last_activity_date:
 *                           type: string
 *                           format: date
 *                           nullable: true
 *                         email_reports_enabled:
 *                           type: boolean
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         deleted_at:
 *                           type: string
 *                           nullable: true
 *                         home_base_course:
 *                           type: object
 *                           nullable: true
 *                     course_progress:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           course:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               subtitle:
 *                                 type: string
 *                           status:
 *                             type: string
 *                             enum: [not_started, in_progress, completed]
 *                           lessons_completed:
 *                             type: integer
 *                           total_lessons:
 *                             type: integer
 *                           completed_at:
 *                             type: string
 *                             nullable: true
 *                           course_report_json:
 *                             type: object
 *                             nullable: true
 *                     perception:
 *                       type: object
 *                       properties:
 *                         total_lessons_completed:
 *                           type: integer
 *                         archetypes:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               subtitle:
 *                                 type: string
 *                               count:
 *                                 type: integer
 *                               percentage:
 *                                 type: integer
 *                               mode:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.get("/users/:userId", authenticate, isAdmin, getUserDetail);

// ─── User Lesson Reports ──────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/users/{userId}/reports:
 *   get:
 *     summary: Get all completed lesson reports for a user (Admin)
 *     description: |
 *       Returns all completed lesson attempts with full report JSON including archetype,
 *       secondary archetype, narrative, prompt insights, and growth sections.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson_reports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           attempt_id:
 *                             type: integer
 *                           lesson:
 *                             type: object
 *                           course:
 *                             type: object
 *                           completed_at:
 *                             type: string
 *                           report:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               archetype:
 *                                 type: object
 *                               secondary_archetype:
 *                                 type: object
 *                               what_shapes_your_thinking:
 *                                 type: string
 *                               prompt_insights:
 *                                 type: array
 *                               moving_across_your_range:
 *                                 type: string
 *                               how_might_this_growth_show_up:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.get("/users/:userId/reports", authenticate, isAdmin, getUserLessonReports);

// ─── User Transcripts ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/users/{userId}/transcripts:
 *   get:
 *     summary: Get all prompt transcripts for a user (Admin)
 *     description: |
 *       Returns all UserPromptResponse records across all lesson attempts,
 *       with lesson and course context per entry.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transcripts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transcripts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           attempt_id:
 *                             type: integer
 *                           lesson:
 *                             type: object
 *                           course:
 *                             type: object
 *                           prompt_number:
 *                             type: integer
 *                             example: 1
 *                           transcript_text:
 *                             type: string
 *                             nullable: true
 *                           duration_seconds:
 *                             type: number
 *                             nullable: true
 *                           submitted_at:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.get("/users/:userId/transcripts", authenticate, isAdmin, getUserTranscripts);

module.exports = router;
