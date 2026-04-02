const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload.middleware");
const { createTaskSchema } = require("../validations/task.validation");
const { createTask } = require("../controller/task.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management system
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a Task (Supports both image and question tasks)
 *     description: |
 *       Unified endpoint to create tasks. 
 *       - For `image` type: Provide an image file via multipart `image` field.
 *       - For `question` type: Provide a JSON string array via the `questions` field.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Identify the Object"
 *               description:
 *                 type: string
 *                 example: "Tell us what you see in the photo."
 *               type:
 *                 type: string
 *                 enum: [image, question]
 *                 example: "image"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Required ONLY for type="image".
 *               questions:
 *                 type: string
 *                 description: JSON object string. Required ONLY for type="question".
 *                 example: '{"1":"How are you?","2":"What is your age?"}'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 task:
 *                   type: object
 *       400:
 *         description: Validation or Transaction error
 */
router.post(
  "/",
  authenticate,
  isAdmin,
  upload.single("image"), // Multer handles multipart file upload
  validate(createTaskSchema),
  createTask
);

module.exports = router;
