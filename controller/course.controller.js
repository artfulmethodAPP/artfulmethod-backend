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
  const courses = await CourseService.getAllCourses();

  return sendSuccess(res, {
    message: "Courses retrieved successfully",
    data: { courses },
  });
});

const getCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await CourseService.getCourseById(courseId);

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
  const content = await CourseService.getLessonContent(lessonId);

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
  createLessonContent,
  getLessonContent,
  updateLessonContent,
};
