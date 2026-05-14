const { z } = require("zod");

const attemptIdSchema = z.object({
  attemptId: z.coerce.number().int().positive("attemptId must be a positive integer"),
});

const courseIdSchema = z.object({
  courseId: z.coerce.number().int().positive("courseId must be a positive integer"),
});

const lessonIdSchema = z.object({
  lessonId: z.coerce.number().int().positive("lessonId must be a positive integer"),
});

const courseLessonParamsSchema = z.object({
  courseId: z.coerce.number().int().positive("courseId must be a positive integer"),
  lessonId: z.coerce.number().int().positive("lessonId must be a positive integer"),
});

const promptSchema = z.object({
  prompt_number: z.number().int().min(1).max(3),
  prompt_text: z.string().trim().min(1),
});

const promptsJsonField = z.preprocess(
  (val) => (typeof val === "string" ? JSON.parse(val) : val),
  z.array(promptSchema).min(3, "3 prompts are required").max(3, "Maximum 3 prompts allowed"),
);

const promptsJsonFieldOptional = z.preprocess(
  (val) => (typeof val === "string" ? JSON.parse(val) : val),
  z.array(promptSchema).min(3, "3 prompts are required").max(3, "Maximum 3 prompts allowed"),
).optional();

const createCourseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  subtitle: z.string().trim().max(100),
  description: z.string().trim(),
  sort_order: z.coerce.number().int().min(0).optional(),
});

const updateCourseSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  subtitle: z.string().trim().max(100).optional(),
  description: z.string().trim().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_active: z.coerce.boolean().optional(),
});

const createLessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  sort_order: z.coerce.number().int().min(0).optional(),
});

const updateLessonSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_active: z.coerce.boolean().optional(),
});

const createLessonContentSchema = z.object({
  artwork_title: z.string().trim().max(200).optional(),
  artwork_info: z.string().trim().optional(),
  artist_name: z.string().trim().max(200).optional(),
  years: z.string().trim().max(50).optional(),
  prompts_json: promptsJsonField,
});

const updateLessonContentSchema = z.object({
  artwork_title: z.string().trim().max(200).optional(),
  artwork_info: z.string().trim().optional(),
  artist_name: z.string().trim().max(200).optional(),
  years: z.string().trim().max(50).optional(),
  prompts_json: promptsJsonFieldOptional,
});

module.exports = {
  attemptIdSchema,
  courseIdSchema,
  lessonIdSchema,
  courseLessonParamsSchema,
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
  createLessonContentSchema,
  updateLessonContentSchema,
};
