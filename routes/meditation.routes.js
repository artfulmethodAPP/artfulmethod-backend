"use strict";

const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const {
  getMeditations,
  getMeditationById,
} = require("../controller/meditation.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Meditations
 *   description: Artful Meditations — guided audio reflections, one per archetype
 */

/**
 * @swagger
 * /api/v1/meditations:
 *   get:
 *     summary: List Artful Meditations
 *     description: Returns active meditations in sequence order (by sort_order), each with presigned image and audio URLs (valid 1 hour) and the shared meditation text.
 *     tags: [Meditations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meditations retrieved successfully
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
 *                   example: "Meditations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meditation'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getMeditations);

/**
 * @swagger
 * /api/v1/meditations/{id}:
 *   get:
 *     summary: Get a single Artful Meditation
 *     description: Returns one meditation with presigned image and audio URLs (valid 1 hour) and the shared meditation text.
 *     tags: [Meditations]
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
 *         description: Meditation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Meditation'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Meditation not found
 *
 * components:
 *   schemas:
 *     Meditation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         archetype:
 *           type: string
 *           example: "Storyteller"
 *         artwork_title:
 *           type: string
 *           example: "Apollo and Daphne"
 *         artist_name:
 *           type: string
 *           example: "Gian Lorenzo Bernini"
 *         years:
 *           type: string
 *           example: "1622–25"
 *         medium:
 *           type: string
 *           example: "Marble"
 *         dimensions:
 *           type: string
 *           example: "H. 243 cm"
 *         location:
 *           type: string
 *           example: "Galleria Borghese, Rome"
 *         about_art:
 *           type: string
 *         audio_duration:
 *           type: string
 *           example: "3:59"
 *         sort_order:
 *           type: integer
 *           example: 2
 *         is_active:
 *           type: boolean
 *         image_url:
 *           type: string
 *           description: Presigned S3 URL (valid 1 hour)
 *           nullable: true
 *         audio_url:
 *           type: string
 *           description: Presigned S3 URL (valid 1 hour)
 *           nullable: true
 *         meditation_text:
 *           type: string
 *           description: Shared meditation copy (same for every meditation)
 */
router.get("/:id", authenticate, getMeditationById);

module.exports = router;
