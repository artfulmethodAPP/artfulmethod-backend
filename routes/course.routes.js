const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const courseImageUploadS3 = require("../middlewares/course-image-s3.middleware");
const {
  courseIdSchema,
  lessonIdSchema,
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
  createLessonContentSchema,
  updateLessonContentSchema,
} = require("../validations/course.validation");
const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  createLesson,
  getLessons,
  updateLesson,
  createLessonContent,
  getLessonContent,
  updateLessonContent,
} = require("../controller/course.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management — content creation (admin) and browsing (user)
 */

// ─── Courses ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a course (Admin)
 *     description: Creates a new course. Optionally upload a course image via multipart `image` field.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "The Storyteller"
 *               subtitle:
 *                 type: string
 *                 example: "NARRATIVE MAKER"
 *               description:
 *                 type: string
 *                 example: "You see the world through narrative and human connection."
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Course image (jpeg, jpg, png, gif, webp, svg — max 10 MB)
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                   example: "Course created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 */
router.post(
  "/",
  authenticate,
  isAdmin,
  courseImageUploadS3.single("image"),
  validate(createCourseSchema),
  createCourse,
);

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: List all courses
 *     description: Returns all courses ordered by sort_order. Each course includes a presigned image URL.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                   example: "Courses retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "The Storyteller"
 *                           subtitle:
 *                             type: string
 *                             example: "NARRATIVE MAKER"
 *                           description:
 *                             type: string
 *                           image_s3_key:
 *                             type: string
 *                           image_url:
 *                             type: string
 *                             example: "https://s3.amazonaws.com/..."
 *                           is_active:
 *                             type: boolean
 *                           sort_order:
 *                             type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getAllCourses);

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   get:
 *     summary: Get a course by ID
 *     description: Returns a single course with its lessons list. Includes a presigned image URL.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
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
 *                   example: "Course retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get(
  "/:courseId",
  authenticate,
  validate(courseIdSchema, "params"),
  getCourse,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}:
 *   put:
 *     summary: Update a course (Admin)
 *     description: Update any course fields. Optionally upload a new image.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             description: Send only the fields you want to change. All fields are optional.
 *             properties:
 *               name:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               description:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New course image (optional)
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *                   example: "Course updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Course not found
 */
router.put(
  "/:courseId",
  authenticate,
  isAdmin,
  validate(courseIdSchema, "params"),
  courseImageUploadS3.single("image"),
  validate(updateCourseSchema),
  updateCourse,
);

// ─── Lessons ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons:
 *   post:
 *     summary: Add a lesson to a course (Admin)
 *     description: Creates a new lesson under the specified course.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "First Impressions"
 *               sort_order:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Lesson created successfully
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
 *                   example: "Lesson created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Course not found
 */
router.post(
  "/:courseId/lessons",
  authenticate,
  isAdmin,
  validate(courseIdSchema, "params"),
  validate(createLessonSchema),
  createLesson,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons:
 *   get:
 *     summary: List lessons for a course
 *     description: Returns all lessons for the given course, ordered by sort_order.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
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
 *                   example: "Lessons retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lessons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           course_id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           sort_order:
 *                             type: integer
 *                           is_active:
 *                             type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get(
  "/:courseId/lessons",
  authenticate,
  validate(courseIdSchema, "params"),
  getLessons,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons/{lessonId}:
 *   put:
 *     summary: Update a lesson (Admin)
 *     description: Update lesson metadata such as title, sort order, or active status.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Send only the fields you want to change. All fields are optional.
 *             properties:
 *               title:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *                   example: "Lesson updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lesson:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Lesson not found
 */
router.put(
  "/:courseId/lessons/:lessonId",
  authenticate,
  isAdmin,
  validate(lessonIdSchema, "params"),
  validate(updateLessonSchema),
  updateLesson,
);

// ─── Lesson Content ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons/{lessonId}/content:
 *   post:
 *     summary: Create lesson content (Admin)
 *     description: |
 *       Attaches artwork metadata and 3 voice prompts to a lesson. Upload the artwork image via multipart `image` field.
 *       Send `prompts_json` as a JSON string in the multipart body.
 *
 *       Example `prompts_json` value:
 *       ```json
 *       [
 *         {"prompt_number": 1, "prompt_text": "What do you notice first?"},
 *         {"prompt_number": 2, "prompt_text": "What feeling does this evoke?"},
 *         {"prompt_number": 3, "prompt_text": "What story might this tell?"}
 *       ]
 *       ```
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - prompts_json
 *               - image
 *             properties:
 *               artwork_title:
 *                 type: string
 *                 example: "The Art of Painting"
 *               artwork_info:
 *                 type: string
 *                 example: "In The Art of Painting, Johannes Vermeer..."
 *               artist_name:
 *                 type: string
 *                 example: "Johannes Vermeer"
 *               years:
 *                 type: string
 *                 example: "1665–1666"
 *               prompts_json:
 *                 type: string
 *                 description: JSON string — array of exactly 3 prompt objects
 *                 example: '[{"prompt_number":1,"prompt_text":"What do you notice first?"},{"prompt_number":2,"prompt_text":"What feeling does this evoke?"},{"prompt_number":3,"prompt_text":"What story might this tell?"}]'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Artwork image (jpeg, jpg, png, gif, webp, svg — max 10 MB)
 *     responses:
 *       201:
 *         description: Lesson content created successfully
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
 *                   example: "Lesson content created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: object
 *       400:
 *         description: Validation error or image missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Lesson not found
 *       409:
 *         description: Content already exists for this lesson — use PUT to update
 */
router.post(
  "/:courseId/lessons/:lessonId/content",
  authenticate,
  isAdmin,
  validate(lessonIdSchema, "params"),
  courseImageUploadS3.single("image"),
  validate(createLessonContentSchema),
  createLessonContent,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons/{lessonId}/content:
 *   get:
 *     summary: Get lesson content
 *     description: Returns the artwork metadata, prompts, and a presigned artwork image URL for the lesson.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson content retrieved successfully
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
 *                   example: "Lesson content retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         course_lesson_id:
 *                           type: integer
 *                         artwork_title:
 *                           type: string
 *                           example: "The Art of Painting"
 *                         artwork_info:
 *                           type: string
 *                         artist_name:
 *                           type: string
 *                           example: "Johannes Vermeer"
 *                         years:
 *                           type: string
 *                           example: "1665–1666"
 *                         prompts_json:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               prompt_number:
 *                                 type: integer
 *                               prompt_text:
 *                                 type: string
 *                         image_s3_key:
 *                           type: string
 *                         image_url:
 *                           type: string
 *                           example: "https://s3.amazonaws.com/..."
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson content not found
 */
router.get(
  "/:courseId/lessons/:lessonId/content",
  authenticate,
  validate(lessonIdSchema, "params"),
  getLessonContent,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons/{lessonId}/content:
 *   put:
 *     summary: Update lesson content (Admin)
 *     description: |
 *       Update artwork metadata and/or prompts for a lesson. Optionally upload a new artwork image.
 *       Send `prompts_json` as a JSON string in the multipart body if updating prompts.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             description: Send only the fields you want to change. All fields are optional.
 *             properties:
 *               artwork_title:
 *                 type: string
 *               artwork_info:
 *                 type: string
 *               artist_name:
 *                 type: string
 *               years:
 *                 type: string
 *               prompts_json:
 *                 type: string
 *                 description: JSON string — array of exactly 3 prompt objects (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New artwork image (optional)
 *     responses:
 *       200:
 *         description: Lesson content updated successfully
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
 *                   example: "Lesson content updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: Lesson content not found
 */
router.put(
  "/:courseId/lessons/:lessonId/content",
  authenticate,
  isAdmin,
  validate(lessonIdSchema, "params"),
  courseImageUploadS3.single("image"),
  validate(updateLessonContentSchema),
  updateLessonContent,
);

module.exports = router;
