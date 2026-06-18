const CourseService = require("../services/course.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const { computeStreak } = require("../services/auth.service");

// ─── Courses ─────────────────────────────────────────────────────────────────

const createCourse = asyncHandler(async (req, res) => {
  const image_s3_key = req.file ? req.file.key : null;

  const course = await CourseService.createCourse({
    ...req.body,
    image_s3_key,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Course created successfully",
    data: { course },
  });
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await CourseService.getAllCourses(req.user.id);

  return sendSuccess(res, {
    message: "Courses retrieved successfully",
    data: { courses },
  });
});

const getCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await CourseService.getCourseById(courseId, req.user.id);

  return sendSuccess(res, {
    message: "Course retrieved successfully",
    data: { course },
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const image_s3_key = req.file ? req.file.key : undefined;

  const course = await CourseService.updateCourse(courseId, {
    ...req.body,
    ...(image_s3_key !== undefined && { image_s3_key }),
  });

  return sendSuccess(res, {
    message: "Course updated successfully",
    data: { course },
  });
});

// ─── Lessons ─────────────────────────────────────────────────────────────────

const createLesson = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const lesson = await CourseService.createLesson(courseId, req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Session created successfully",
    data: { lesson },
  });
});

const getLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const lessons = await CourseService.getLessonsByCourse(courseId);

  return sendSuccess(res, {
    message: "Sessions retrieved successfully",
    data: { lessons },
  });
});

const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await CourseService.updateLesson(lessonId, req.body);

  return sendSuccess(res, {
    message: "Session updated successfully",
    data: { lesson },
  });
});

// ─── Start Lesson ─────────────────────────────────────────────────────────────

const startLesson = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user.id;

  const attempt = await CourseService.startLesson(userId, courseId, lessonId);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Session started successfully",
    data: { attempt },
  });
});

// ─── Transcribe Lesson Prompts (API 1 of 2) ──────────────────────────────────
//
// Transcribes the 3 prompts (audio via ElevenLabs, or plain text) and returns
// the transcripts for the "edit your transcript" screen. The micro-report is
// generated separately by completeLesson, keeping that request fast.
//
// Accepted multipart fields (same as before):
//   audio_1 / audio_2 / audio_3  → binary file (priority over text of same number)
//   text_1  / text_2  / text_3   → plain text string
const transcribeLessonPrompts = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user.id;

  const namedFiles =
    req.files && typeof req.files === "object" && !Array.isArray(req.files)
      ? req.files
      : {};
  const b = req.body || {};

  const prompts = [1, 2, 3].map((n) => {
    const fileArr = namedFiles[`audio_${n}`];
    const file = fileArr && fileArr.length ? fileArr[0] : null;
    const text = (!file && (b[`text_${n}`] || b[`audio_${n}`])) || null;
    return { promptNumber: n, file, text };
  });

  const result = await CourseService.transcribeLessonPrompts(attemptId, userId, {
    prompts,
  });

  return sendSuccess(res, {
    message: "Prompts transcribed successfully",
    data: result,
  });
});

// ─── Complete Lesson (API 2 of 2) ─────────────────────────────────────────────
//
// Receives the 3 final (possibly edited) transcripts as text, runs the archetype
// analysis, and returns the session micro-report. No audio here.
//
// Accepted body fields: text_1 / text_2 / text_3  (JSON or form fields)
const completeLesson = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user.id;
  const b = req.body || {};

  const prompts = [1, 2, 3].map((n) => ({
    promptNumber: n,
    text: b[`text_${n}`] ?? null,
  }));

  const [result, streak] = await Promise.all([
    CourseService.completeLesson(attemptId, userId, { prompts }),
    computeStreak(req.user),
  ]);

  return sendSuccess(res, {
    message: "Session completed successfully",
    data: { ...result, streak_count: streak.streakCount, longest_streak: streak.longestStreak, last_activity_date: streak.lastActivityDate },
  });
});

const getLessonReport = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const report = await CourseService.getLessonReport(attemptId, req.user.id);

  return sendSuccess(res, {
    message: "Session report retrieved successfully",
    data: { report },
  });
});

// ─── Course Report (Growth in Range) ─────────────────────────────────────────

const getCourseReport = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const data = await CourseService.getCourseReport(courseId, req.user.id);

  return sendSuccess(res, {
    message: "Course report retrieved successfully",
    data,
  });
});

const getCourseReportPdf = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const data = await CourseService.getCourseReportPdf(courseId, req.user.id);

  return sendSuccess(res, {
    message: "Course report PDF URL generated",
    data,
  });
});

// ─── Lesson Content ───────────────────────────────────────────────────────────

const createLessonContent = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const image_s3_key = req.file ? req.file.key : null;

  const content = await CourseService.createLessonContent(lessonId, {
    ...req.body,
    image_s3_key,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Session content created successfully",
    data: { content },
  });
});

const getLessonContent = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const content = await CourseService.getLessonContent(lessonId, req.user.id);

  return sendSuccess(res, {
    message: "Session content retrieved successfully",
    data: { content },
  });
});

const updateLessonContent = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const image_s3_key = req.file ? req.file.key : undefined;

  const content = await CourseService.updateLessonContent(lessonId, {
    ...req.body,
    ...(image_s3_key !== undefined && { image_s3_key }),
  });

  return sendSuccess(res, {
    message: "Session content updated successfully",
    data: { content },
  });
});

const getPerceptionDashboard = asyncHandler(async (req, res) => {
  const data = await CourseService.getPerceptionDashboard(req.user.id);
  return sendSuccess(res, {
    message: "Perception dashboard retrieved successfully",
    data,
  });
});

const getArchetypePerceptionReport = asyncHandler(async (req, res) => {
  const { archetype } = req.params;
  const data = await CourseService.getArchetypePerceptionReport(req.user.id, archetype);
  return sendSuccess(res, {
    message: "Archetype perception report retrieved successfully",
    data,
  });
});

const getHomeDashboard = asyncHandler(async (req, res) => {
  const data = await CourseService.getHomeDashboard(req.user.id);
  return sendSuccess(res, {
    message: "Home dashboard retrieved successfully",
    data,
  });
});

module.exports = {
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
};
