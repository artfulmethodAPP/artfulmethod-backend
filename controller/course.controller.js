const CourseService = require("../services/course.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");

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
    message: "Lesson created successfully",
    data: { lesson },
  });
});

const getLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const lessons = await CourseService.getLessonsByCourse(courseId);

  return sendSuccess(res, {
    message: "Lessons retrieved successfully",
    data: { lessons },
  });
});

const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await CourseService.updateLesson(lessonId, req.body);

  return sendSuccess(res, {
    message: "Lesson updated successfully",
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
    message: "Lesson started successfully",
    data: { attempt },
  });
});

// ─── Complete Lesson ──────────────────────────────────────────────────────────

const completeLesson = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user.id;

  // Build a per-prompt descriptor for each of the 3 prompts.
  // Each prompt can independently be an audio file OR plain text.
  //
  // Accepted multipart fields:
  //   audio_1 / audio_2 / audio_3  → binary file  (takes priority over text field of same number)
  //   text_1  / text_2  / text_3   → plain text string
  //
  // Result: prompts = [
  //   { promptNumber: 1, file: <multerFile|null>, text: <string|null> },
  //   { promptNumber: 2, file: <multerFile|null>, text: <string|null> },
  //   { promptNumber: 3, file: <multerFile|null>, text: <string|null> },
  // ]

  const namedFiles = (req.files && typeof req.files === "object" && !Array.isArray(req.files))
    ? req.files
    : {};
  const b = req.body || {};

  const prompts = [1, 2, 3].map((n) => {
    const fileArr = namedFiles[`audio_${n}`];
    const file = fileArr && fileArr.length ? fileArr[0] : null;
    // Text falls back: text_N first, then audio_N body field (plain text sent as multipart text)
    const text = (!file && (b[`text_${n}`] || b[`audio_${n}`])) || null;
    return { promptNumber: n, file, text };
  });

  const result = await CourseService.completeLesson(attemptId, userId, { prompts });

  return sendSuccess(res, {
    message: "Lesson completed successfully",
    data: result,
  });
});

const getLessonReport = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const report = await CourseService.getLessonReport(attemptId, req.user.id);

  return sendSuccess(res, {
    message: "Lesson report retrieved successfully",
    data: { report },
  });
});

const getLessonReportPdf = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const data = await CourseService.getLessonReportPdf(attemptId, req.user.id);

  return sendSuccess(res, {
    message: "Lesson report PDF URL generated",
    data,
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
    message: "Lesson content created successfully",
    data: { content },
  });
});

const getLessonContent = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const content = await CourseService.getLessonContent(lessonId, req.user.id);

  return sendSuccess(res, {
    message: "Lesson content retrieved successfully",
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
    message: "Lesson content updated successfully",
    data: { content },
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
  completeLesson,
  getLessonReport,
  getLessonReportPdf,
  getCourseReport,
  getCourseReportPdf,
  createLessonContent,
  getLessonContent,
  updateLessonContent,
};
