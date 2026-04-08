const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  getAllTasksSchema,
  taskParamsSchema,
} = require("../validations/task.validation");
const {
  createTask,
  updateTask,
  getAllTasks,
  deleteTask,
} = require("../controller/task.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management system
 */

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Edit a task
 *     description: |
 *       Partially update an existing task. Admin only.
 *       - To keep the current type, send only the fields you want to change.
 *       - To change the task to `image`, upload a new file in the `image` field.
 *       - To change the task to `question`, send `questions` as a JSON object string.
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
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *                 example: "Updated task description"
 *               type:
 *                 type: string
 *                 enum: [image, question]
 *                 example: "question"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Required when changing a task to `image`.
 *               questions:
 *                 type: string
 *                 description: JSON object string for question tasks.
 *                 example: '{"1":"What do you notice first?","2":"Why did you choose that answer?"}'
 *     responses:
 *       200:
 *         description: Task updated successfully
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
 *                   example: "Task updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Task not found
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
 *                     deleted_at:
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
router.delete(
  "/:id",
  authenticate,
  isAdmin,
  validate(taskParamsSchema, "params"),
  deleteTask,
);

router.put(
  "/:id",
  authenticate,
  isAdmin,
  validate(taskParamsSchema, "params"),
  upload.single("image"),
  validate(updateTaskSchema),
  updateTask,
);

router.patch(
  "/:id",
  authenticate,
  isAdmin,
  validate(taskParamsSchema, "params"),
  upload.single("image"),
  validate(updateTaskSchema),
  updateTask,
);

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
  upload.single("image"), 
  validate(createTaskSchema),
  createTask
);

module.exports = router;
