const { Course, CourseLesson, LessonContent } = require("../models");
const AppError = require("../utils/app-error");
const { getPresignedUrl } = require("./s3.service");

// ─── Courses ─────────────────────────────────────────────────────────────────

const createCourse = async (data) => {
  const { name, subtitle, description, image_s3_key, sort_order } = data;

  const course = await Course.create({
    name,
    subtitle,
    description,
    image_s3_key,
    sort_order: sort_order ?? 0,
    is_active: true,
  });

  return course;
};

const getAllCourses = async () => {
  const courses = await Course.findAll({
    order: [["sort_order", "ASC"]],
  });

  const result = await Promise.all(
    courses.map(async (c) => {
      const { image_s3_key, ...plain } = c.toJSON();
      plain.image_url = image_s3_key ? await getPresignedUrl(image_s3_key) : null;
      return plain;
    }),
  );

  return result;
};

const getCourseById = async (courseId) => {
  const course = await Course.findByPk(courseId, {
    include: [{ model: CourseLesson, order: [["sort_order", "ASC"]] }],
  });

  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const { image_s3_key, ...plain } = course.toJSON();
  plain.image_url = image_s3_key ? await getPresignedUrl(image_s3_key) : null;

  return plain;
};

const updateCourse = async (courseId, data) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const allowed = ["name", "subtitle", "description", "image_s3_key", "sort_order", "is_active"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  await course.update(updates);
  return course;
};

// ─── Lessons ─────────────────────────────────────────────────────────────────

const createLesson = async (courseId, data) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const { title, sort_order } = data;

  const lesson = await CourseLesson.create({
    course_id: courseId,
    title,
    sort_order: sort_order ?? 0,
    is_active: true,
  });

  return lesson;
};

const getLessonsByCourse = async (courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const lessons = await CourseLesson.findAll({
    where: { course_id: courseId },
    order: [["sort_order", "ASC"]],
  });

  return lessons;
};

const updateLesson = async (lessonId, data) => {
  const lesson = await CourseLesson.findByPk(lessonId);
  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");

  const allowed = ["title", "duration_minutes", "sort_order", "is_active"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  await lesson.update(updates);
  return lesson;
};

// ─── Lesson Content ───────────────────────────────────────────────────────────

const createLessonContent = async (lessonId, data) => {
  const lesson = await CourseLesson.findByPk(lessonId);
  if (!lesson) throw new AppError("Lesson not found", 404, "NOT_FOUND");

  const existing = await LessonContent.findOne({ where: { course_lesson_id: lessonId } });
  if (existing) throw new AppError("Lesson content already exists for this lesson. Use update instead.", 409, "CONFLICT");

  const { artwork_title, artwork_info, artist_name, years, prompts_json, image_s3_key } = data;

  if (!image_s3_key) {
    throw new AppError("image_s3_key is required", 400, "VALIDATION_ERROR");
  }

  const content = await LessonContent.create({
    course_lesson_id: lessonId,
    artwork_title,
    artwork_info,
    artist_name,
    years,
    prompts_json,
    image_s3_key,
  });

  return content;
};

const getLessonContent = async (lessonId) => {
  const content = await LessonContent.findOne({ where: { course_lesson_id: lessonId } });
  if (!content) throw new AppError("Lesson content not found", 404, "NOT_FOUND");

  const { image_s3_key, ...plain } = content.toJSON();
  plain.image_url = image_s3_key ? await getPresignedUrl(image_s3_key) : null;

  return plain;
};

const updateLessonContent = async (lessonId, data) => {
  const content = await LessonContent.findOne({ where: { course_lesson_id: lessonId } });
  if (!content) throw new AppError("Lesson content not found", 404, "NOT_FOUND");

  const allowed = ["artwork_title", "artwork_info", "artist_name", "years", "prompts_json", "image_s3_key"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  await content.update(updates);
  return content;
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  createLesson,
  getLessonsByCourse,
  updateLesson,
  createLessonContent,
  getLessonContent,
  updateLessonContent,
};







