const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(1, "Description is required"),
  type: z.literal("image", { error: "Type must be image" }),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200)
    .optional(),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .optional(),
  is_active: z.coerce.boolean().optional(),
});

const getAllTasksSchema = z.object({
  type: z.literal("image").optional(),
});

const recentTaskSchema = z.object({
  type: z.literal("image", { error: "Type must be image" }),
});

const taskParamsSchema = z.object({
  id: z.coerce.number().int().positive("Task id must be a positive number"),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  getAllTasksSchema,
  recentTaskSchema,
  taskParamsSchema,
};
