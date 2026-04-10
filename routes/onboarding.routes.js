const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const {
  createOnboardingQuestionSchema,
  updateOnboardingQuestionSchema,
  onboardingParamsSchema,
} = require("../validations/onboarding.validation");
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controller/onboarding.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: Onboarding questions management
 */

/**
 * @swagger
 * /api/v1/onboarding:
 *   get:
 *     summary: Get all onboarding questions
 *     description: Retrieve all onboarding questions. Accessible by authenticated users.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding questions retrieved successfully
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
 *                   example: "Onboarding questions retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create an onboarding question (Admin only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - question_text
 *             properties:
 *               key:
 *                 type: string
 *                 example: "goal"
 *               question_text:
 *                 type: string
 *                 example: "What is your main goal?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Lose weight", "Build muscle", "Improve flexibility"]
 *     responses:
 *       201:
 *         description: Onboarding question created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       409:
 *         description: Question with this key already exists
 */
router.get("/", authenticate, getAllQuestions);

router.post(
  "/",
  authenticate,
  isAdmin,
  validate(createOnboardingQuestionSchema),
  createQuestion,
);

/**
 * @swagger
 * /api/v1/onboarding/{id}:
 *   get:
 *     summary: Get a single onboarding question by ID
 *     tags: [Onboarding]
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
 *         description: Onboarding question retrieved successfully
 *       404:
 *         description: Question not found
 *   patch:
 *     summary: Update an onboarding question (Admin only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               question_text:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Onboarding question updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Question not found
 *   delete:
 *     summary: Delete an onboarding question (Admin only)
 *     tags: [Onboarding]
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
 *         description: Onboarding question deleted successfully
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Question not found
 */
router.get(
  "/:id",
  authenticate,
  validate(onboardingParamsSchema, "params"),
  getQuestionById,
);

router.patch(
  "/:id",
  authenticate,
  isAdmin,
  validate(onboardingParamsSchema, "params"),
  validate(updateOnboardingQuestionSchema),
  updateQuestion,
);

router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validate(onboardingParamsSchema, "params"),
  deleteQuestion,
);

module.exports = router;
