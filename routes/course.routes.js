const express = require("express");
const authenticate = require("../middlewares/authenticate.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate");
const courseImageUploadS3 = require("../middlewares/course-image-s3.middleware");
const courseAudioUpload = require("../middlewares/course-audio.middleware");
const {
  attemptIdSchema,
  completeLessonSchema,
  courseIdSchema,
  lessonIdSchema,
  courseLessonParamsSchema,
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
  startLesson,
  transcribeLessonPrompts,
  completeLesson,
  getLessonReport,
  getCourseReport,
  getCourseReportPdf,
  createLessonContent,
  getLessonContent,
  updateLessonContent,
  getPerceptionDashboard,
  getArchetypePerceptionReport,
  getHomeDashboard,
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
  // isAdmin,
  courseImageUploadS3.single("image"),
  validate(createCourseSchema),
  createCourse,
);

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: List all courses
 *     description: |
 *       Returns all active courses ordered with the user's **home base course first**, then the
 *       remaining courses by `sort_order`. Each course includes a presigned image URL, an
 *       `is_home_base` flag, and a `user_progress` block showing the user's status for that course.
 *
 *       **Lock logic:** the home base course is always unlocked. Every subsequent course is locked
 *       until the previous course is completed.
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
 *                           image_url:
 *                             type: string
 *                             example: "https://s3.amazonaws.com/..."
 *                           is_active:
 *                             type: boolean
 *                           sort_order:
 *                             type: integer
 *                           is_home_base:
 *                             type: boolean
 *                             description: True if this is the user's assigned home base course
 *                             example: true
 *                           user_progress:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                                 enum: [locked, not_started, in_progress, completed]
 *                                 example: "in_progress"
 *                               lessons_completed:
 *                                 type: integer
 *                                 example: 3
 *                               total_lessons:
 *                                 type: integer
 *                                 example: 10
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getAllCourses);

// ─── Perception Dashboard ─────────────────────────────────────────────────────
// NOTE: These static routes must be declared BEFORE /:courseId to avoid collision.

/**
 * @swagger
 * /api/v1/courses/perception:
 *   get:
 *     summary: Get perception dashboard (aggregated archetype counts)
 *     description: |
 *       Aggregates all completed lessons across all courses for the authenticated user.
 *       Returns archetype counts and percentages for all 5 archetypes, sorted by count descending.
 *       When `total_lessons_completed === 0` the frontend should show an empty state.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perception dashboard data
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
 *                     total_lessons_completed:
 *                       type: integer
 *                       example: 4
 *                     archetypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Framer"
 *                           subtitle:
 *                             type: string
 *                             example: "Structure Seeker"
 *                           count:
 *                             type: integer
 *                             example: 2
 *                           percentage:
 *                             type: integer
 *                             example: 50
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/v1/courses/home:
 *   get:
 *     summary: Get home dashboard data
 *     description: Returns the user's name, current streak, longest streak, last activity date, and total sessions completed.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home dashboard retrieved successfully
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
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     current_streak:
 *                       type: integer
 *                       example: 5
 *                     longest_streak:
 *                       type: integer
 *                       example: 12
 *                     last_activity_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2026-05-22"
 *                     sessions_completed:
 *                       type: integer
 *                       example: 8
 *       401:
 *         description: Unauthorized
 */
router.get("/home", authenticate, getHomeDashboard);

router.get("/perception", authenticate, getPerceptionDashboard);

/**
 * @swagger
 * /api/v1/courses/perception/{archetype}:
 *   get:
 *     summary: Get full perception report for a specific archetype
 *     description: |
 *       Returns the full aggregated report for a specific archetype across all lessons where
 *       that archetype was the primary. Includes static copy, lesson quotes, and expanding range content.
 *       Valid archetypes: `Storyteller`, `Framer`, `Archivist`, `Artist`, `Integrator`.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: archetype
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Storyteller, Framer, Archivist, Artist, Integrator]
 *         description: Archetype name (case-sensitive)
 *         example: Framer
 *     responses:
 *       200:
 *         description: Archetype perception report
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
 *                     archetype:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Framer"
 *                         subtitle:
 *                           type: string
 *                           example: "Structure Seeker"
 *                         description:
 *                           type: string
 *                         lesson_count:
 *                           type: integer
 *                           example: 2
 *                     sections:
 *                       type: object
 *                       properties:
 *                         aesthetic_archetype_portrait:
 *                           type: string
 *                         primary_aesthetic_archetype:
 *                           type: string
 *                         why_this_matters:
 *                           type: string
 *                         what_you_said:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               lesson_title:
 *                                 type: string
 *                               attempt_id:
 *                                 type: integer
 *                               quotes:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                         expanding_your_range:
 *                           type: object
 *                           properties:
 *                             moving_toward:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   archetype:
 *                                     type: string
 *                                   text:
 *                                     type: string
 *       400:
 *         description: Invalid archetype name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No completed lessons found for this archetype
 */
router.get("/perception/:archetype", authenticate, getArchetypePerceptionReport);

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
  validate(courseLessonParamsSchema, "params"),
  validate(updateLessonSchema),
  updateLesson,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/lessons/{lessonId}/start:
 *   post:
 *     summary: Start a lesson
 *     description: |
 *       Creates a lesson attempt for the authenticated user (idempotent — returns existing attempt if already started).
 *
 *       **Lock rules enforced:**
 *       - A course with `sort_order > 1` cannot be started until the previous course (`sort_order - 1`) is completed.
 *       - A lesson with `sort_order > 1` cannot be started until the previous lesson (`sort_order - 1`) is completed.
 *
 *       Also creates a `UserCourseProgress` row on first lesson of each course.
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
 *       201:
 *         description: Lesson started (or already in progress)
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
 *                   example: "Lesson started successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attempt:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         course_id:
 *                           type: integer
 *                         course_lesson_id:
 *                           type: integer
 *                         status:
 *                           type: string
 *                           enum: [in_progress, completed]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Course or lesson is locked — previous course/lesson not yet completed
 *       404:
 *         description: Course or lesson not found
 */
router.post(
  "/:courseId/lessons/:lessonId/start",
  authenticate,
  validate(courseLessonParamsSchema, "params"),
  startLesson,
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
  validate(courseLessonParamsSchema, "params"),
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
  validate(courseLessonParamsSchema, "params"),
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
  validate(courseLessonParamsSchema, "params"),
  courseImageUploadS3.single("image"),
  validate(updateLessonContentSchema),
  updateLessonContent,
);

// ─── Attempt Routes (declared before /:courseId to avoid param collision) ─────

/**
 * @swagger
 * /api/v1/courses/attempts/{attemptId}/complete:
 *   post:
 *     summary: Complete a lesson — submit 3 prompt responses (mixed audio + text)
 *     description: |
 *       Submit responses for all 3 prompts of a lesson. **Each prompt is independent** — you can
 *       send an audio file for some prompts and plain text for others in any combination.
 *
 *       Always send as **`multipart/form-data`**. For each prompt number N (1, 2, 3):
 *       - Send `audio_N` as a **binary file** → transcribed via ElevenLabs, audio stored to S3
 *       - OR send `text_N` as a **plain text field** → used directly, no transcription
 *
 *       Every prompt must have one or the other — missing a prompt returns `400`.
 *
 *       **Examples:**
 *       - All audio: `audio_1=<file>`, `audio_2=<file>`, `audio_3=<file>`
 *       - All text: `text_1="..."`, `text_2="..."`, `text_3="..."`
 *       - Mixed: `audio_1=<file>`, `text_2="..."`, `audio_3=<file>`
 *
 *       **Audio S3 key pattern** (for audit/search):
 *       `courses/audio/user_{userId}/lesson_{lessonId}/attempt_{attemptId}/prompt_{N}.ext`
 *
 *       After all prompts are processed the server will:
 *       1. Save transcripts + audio keys to `User_Prompt_Responses`
 *       2. Run Claude archetype analysis across all 3 transcripts
 *       3. Generate a PDF report — store PDF + JSON to S3
 *       4. Mark the attempt `completed`, increment `lessons_completed` on course progress
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson attempt ID (returned from POST /start)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             description: |
 *               For each prompt N (1, 2, 3) send EITHER audio_N (binary) OR text_N (string).
 *               Any combination is valid. All 3 prompts must be provided.
 *             properties:
 *               audio_1:
 *                 type: string
 *                 format: binary
 *                 description: "Audio for prompt 1 (mp3, wav, m4a, webm, ogg, aac — max 50 MB). Takes priority over text_1."
 *               text_1:
 *                 type: string
 *                 description: "Plain text response for prompt 1 (used when audio_1 is not provided)"
 *                 example: "The painting feels very still, almost like time has stopped..."
 *               audio_2:
 *                 type: string
 *                 format: binary
 *                 description: "Audio for prompt 2. Takes priority over text_2."
 *               text_2:
 *                 type: string
 *                 description: "Plain text response for prompt 2 (used when audio_2 is not provided)"
 *                 example: "I notice the light coming from the left window..."
 *               audio_3:
 *                 type: string
 *                 format: binary
 *                 description: "Audio for prompt 3. Takes priority over text_3."
 *               text_3:
 *                 type: string
 *                 description: "Plain text response for prompt 3 (used when audio_3 is not provided)"
 *                 example: "It reminds me of a private moment you weren't meant to see..."
 *     responses:
 *       200:
 *         description: Lesson completed and report generated
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
 *                   example: "Lesson completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attempt_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: completed
 *       400:
 *         description: A prompt is missing both audio and text, or exactly 3 prompts not provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt not found
 *       409:
 *         description: Lesson already completed
 */
/**
 * @swagger
 * /api/v1/courses/attempts/{attemptId}/transcribe:
 *   post:
 *     summary: Transcribe a lesson's 3 prompts (step 1 of 2)
 *     description: |
 *       Transcribes the 3 prompt responses and returns the transcripts for the
 *       "edit your transcript" screen. **Each prompt is independent** — send an
 *       audio file or plain text per prompt, in any combination.
 *
 *       Always send as **`multipart/form-data`**. For each prompt N (1, 2, 3):
 *       - `audio_N` as a **binary file** → transcribed via ElevenLabs, audio stored to S3
 *       - OR `text_N` as a **plain text field** → used directly
 *
 *       This does NOT generate the report — call `/complete` with the final
 *       (edited) transcripts afterwards. Splitting the slow transcription off the
 *       report request avoids gateway timeouts.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio_1:
 *                 type: string
 *                 format: binary
 *                 description: Audio for prompt 1 (or send text_1 instead)
 *               text_1:
 *                 type: string
 *                 description: Text for prompt 1 (or send audio_1 instead)
 *               audio_2:
 *                 type: string
 *                 format: binary
 *                 description: Audio for prompt 2 (or send text_2 instead)
 *               text_2:
 *                 type: string
 *                 description: Text for prompt 2 (or send audio_2 instead)
 *               audio_3:
 *                 type: string
 *                 format: binary
 *                 description: Audio for prompt 3 (or send text_3 instead)
 *               text_3:
 *                 type: string
 *                 description: Text for prompt 3 (or send audio_3 instead)
 *     responses:
 *       200:
 *         description: Prompts transcribed; returns transcripts to review/edit
 *       400:
 *         description: A prompt is missing both audio and text
 *       404:
 *         description: Attempt not found
 *       409:
 *         description: Lesson already completed
 */
router.post(
  "/attempts/:attemptId/transcribe",
  authenticate,
  validate(attemptIdSchema, "params"),
  courseAudioUpload.fields([
    { name: "audio_1", maxCount: 1 },
    { name: "audio_2", maxCount: 1 },
    { name: "audio_3", maxCount: 1 },
  ]),
  transcribeLessonPrompts,
);

/**
 * @swagger
 * /api/v1/courses/attempts/{attemptId}/complete:
 *   post:
 *     summary: Complete a lesson — submit final transcripts, generate report (step 2 of 2)
 *     description: |
 *       Submit the 3 final (possibly edited) transcripts as text. Runs the Session
 *       Read archetype analysis and returns the micro-report. **No audio here** —
 *       transcription happens in the separate `/transcribe` step.
 *
 *       Send as JSON (or form fields): `text_1`, `text_2`, `text_3` — all required.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text_1, text_2, text_3]
 *             properties:
 *               text_1: { type: string }
 *               text_2: { type: string }
 *               text_3: { type: string }
 *     responses:
 *       200:
 *         description: Lesson completed and report generated
 *       400:
 *         description: A transcript is missing
 *       404:
 *         description: Attempt not found
 *       409:
 *         description: Lesson already completed
 */
router.post(
  "/attempts/:attemptId/complete",
  authenticate,
  validate(attemptIdSchema, "params"),
  validate(completeLessonSchema, "body"),
  completeLesson,
);

/**
 * @swagger
 * /api/v1/courses/attempts/{attemptId}/report:
 *   get:
 *     summary: Get lesson report JSON
 *     description: |
 *       Returns the cached archetype analysis report for the completed lesson.
 *       Reads from S3 — Claude is **not** re-run on repeat calls.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report retrieved successfully
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
 *                     report:
 *                       type: object
 *                       description: Full archetype analysis result (archetype, teaserCards, quotesAndMeanings, report sections)
 *       400:
 *         description: Lesson not yet completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attempt or report not found
 */
router.get(
  "/attempts/:attemptId/report",
  authenticate,
  validate(attemptIdSchema, "params"),
  getLessonReport,
);

// ─── Course Report (Growth in Range) ──────────────────────────────────────────

/**
 * @swagger
 * /api/v1/courses/{courseId}/report:
 *   get:
 *     summary: Get Growth in Range course report
 *     description: |
 *       Returns the full Growth in Range (GiR) report for a completed course — a synthesis of all
 *       10 lesson transcripts showing how the user moves across the five aesthetic archetypes.
 *
 *       **Locked until all 10 lessons are completed.** Returns `403` if the course is not yet done.
 *
 *       The report is cached as JSON in S3 after the first call — Claude is **not** re-run on
 *       repeat requests.
 *
 *       **Report sections:**
 *       - `home_base` — dominant archetype across all lessons
 *       - `range_modes` — other archetypes observed
 *       - `absent_modes` — archetypes never expressed
 *       - `mode_counts` — frequency map per archetype
 *       - `report.fixed_intro` — static introductory paragraph
 *       - `report.how_you_see` — summary of the user's perceptual home base
 *       - `report.quotes_and_meanings` — verbatim quotes + VTS commentary, per lesson
 *       - `report.your_range` — thematic synthesis across the range of archetypes
 *       - `report.absent_modes_sentence` — one sentence about absent modes
 *       - `report.how_might_this_show_up` — practical implications
 *       - `report.home_base_archetype_description` — archetype description from design system
 *       - `pdf_url` — presigned S3 URL to download the full PDF report
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
 *         description: Course report retrieved successfully
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
 *                   example: "Course report retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     home_base:
 *                       type: string
 *                       example: "Storyteller"
 *                     range_modes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Framer", "Archivist"]
 *                     absent_modes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Artist", "Integrator"]
 *                     mode_counts:
 *                       type: object
 *                       example: { "Storyteller": 6, "Framer": 3, "Archivist": 1 }
 *                     report:
 *                       type: object
 *                       properties:
 *                         fixed_intro:
 *                           type: string
 *                         how_you_see:
 *                           type: string
 *                         quotes_and_meanings:
 *                           type: array
 *                           items:
 *                             type: object
 *                         your_range:
 *                           type: string
 *                         absent_modes_sentence:
 *                           type: string
 *                         how_might_this_show_up:
 *                           type: string
 *                         home_base_archetype_description:
 *                           type: string
 *                     pdf_url:
 *                       type: string
 *                       example: "https://s3.amazonaws.com/..."
 *       403:
 *         description: Course not yet completed — all 10 lessons must be finished first
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found or no progress record
 */
router.get(
  "/:courseId/report",
  authenticate,
  validate(courseIdSchema, "params"),
  getCourseReport,
);

/**
 * @swagger
 * /api/v1/courses/{courseId}/report/pdf:
 *   get:
 *     summary: Get Growth in Range course report PDF (presigned URL)
 *     description: |
 *       Returns a short-lived presigned S3 URL to download the Growth in Range PDF report.
 *       The course must be completed and the report must have been generated first via
 *       `GET /courses/:courseId/report`.
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
 *         description: PDF URL generated
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
 *                     pdf_url:
 *                       type: string
 *                       example: "https://s3.amazonaws.com/..."
 *       403:
 *         description: Course not yet completed
 *       404:
 *         description: PDF not yet generated — call GET /courses/:courseId/report first
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:courseId/report/pdf",
  authenticate,
  validate(courseIdSchema, "params"),
  getCourseReportPdf,
);

module.exports = router;
