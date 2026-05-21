"use strict";

const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const { getUsers } = require("../controller/admin.controller");

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

module.exports = router;
