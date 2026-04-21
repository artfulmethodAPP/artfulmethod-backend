const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate")
const upload = require("../middlewares/upload.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  getAllTasksSchema,
  recentTaskSchema,
  taskParamsSchema,
} = require("../validations/task.validation");
const {
  createTask,
  updateTask,
  getRecentTasks,
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
 *       Partially update an existing image task. Admin only.
 *       - Send only the fields you want to change.
 *       - To update the image, upload a new file in the `image` field.
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
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file for the task.
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
 * /api/v1/tasks/recent:
 *   get:
 *     summary: Get the most recent image task
 *     description: |
 *       Retrieve the latest image task.
 *       - Regular users: Can only get the latest active task.
 *       - Admin users: Can get the latest task, including inactive or soft-deleted tasks.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [image]
 *         description: Task type (image only)
 *     responses:
 *       200:
 *         description: Recent task retrieved successfully
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
 *                   example: "Recent task retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: object
 *                       nullable: true
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/recent",
  authenticate,
  validate(recentTaskSchema, "query"),
  getRecentTasks,
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: |
 *       Retrieve all image tasks.
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
 *           enum: [image]
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
 *     summary: Create an image task
 *     description: |
 *       Create a new image task. Provide an image file via multipart `image` field.
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
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Identify the Object"
 *               description:
 *                 type: string
 *                 example: "Tell us what you see in the photo."
 *               type:
 *                 type: string
 *                 enum: [image]
 *                 example: "image"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Required image file.
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
