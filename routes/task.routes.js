const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload.middleware");
<<<<<<< HEAD
const { createTaskSchema, getAllTasksSchema } = require("../validations/task.validation");
const { createTask, getAllTasks, deleteTask } = require("../controller/task.controller");
=======
const { createTaskSchema } = require("../validations/task.validation");
const { createTask } = require("../controller/task.controller");
>>>>>>> 5c1ee93a6d068a3bff3b4184ef7f2d47e8e8cbda

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management system
 */

/**
 * @swagger
<<<<<<< HEAD
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Perform a soft delete on a task. (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
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
 *                   example: "Task deleted successfully"
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     is_active:
 *                       type: boolean
 *                       example: false
 *                     is_deleted:
 *                       type: boolean
 *                       example: true
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-04-03T12:30:00.000Z"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       403:
 *         description: Access denied (Admin only)
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authenticate, isAdmin, deleteTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: |
 *       Retrieve all tasks with optional filtering by type.
 *       - Regular users: Can only see active tasks.
 *       - Admin users: Can see all tasks (both active and inactive).
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, question]
 *         description: Filter by task type
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, validate(getAllTasksSchema, "query"), getAllTasks);

/**
 * @swagger
=======
>>>>>>> 5c1ee93a6d068a3bff3b4184ef7f2d47e8e8cbda
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
<<<<<<< HEAD
  upload.single("image"), 
=======
  upload.single("image"), // Multer handles multipart file upload
>>>>>>> 5c1ee93a6d068a3bff3b4184ef7f2d47e8e8cbda
  validate(createTaskSchema),
  createTask
);

module.exports = router;
