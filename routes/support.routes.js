"use strict";

const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const validate = require("../middlewares/validate");
const { contact } = require("../controller/support.controller");
const { contactSchema } = require("../validations/support.validation");

const router = express.Router();

router.use(authenticate);
/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Support management — submitting feedback and contacting support
 */

/**
 * @swagger
 * /api/v1/support/contact:
 *   post:
 *     summary: Send a "Get in touch" message
 *     description: |
 *       Submits a free-text feedback / contact message for the authenticated user.
 *       The message is appended to the user's feedback history and emailed to the
 *       support inbox. The sender's name and email are taken from their account.
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 5000
 *                 example: "I just want to say hello and tell you that I love your Artful Method! It helped me a lot."
 *     responses:
 *       200:
 *         description: Message received
 *       400:
 *         description: Validation error (empty or too-long message)
 *       401:
 *         description: Unauthorized
 */
router.post("/contact", validate(contactSchema, "body"), contact);

module.exports = router;
