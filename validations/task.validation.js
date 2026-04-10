const { z } = require("zod");

const questionMapSchema = z.record(
  z.string(),
  z.string().trim().min(1, "Question is required"),
);

const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().trim().min(1, "Description is required"),
    type: z.enum(["image", "question"], {
      error: "Type must be image or question",
    }),
    questions: questionMapSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasQuestions = !!data.questions && Object.keys(data.questions).length > 0;

    if (
      data.type === "question" &&
      !hasQuestions
    ) {
      ctx.addIssue({
        path: ["questions"],
        message: "questions are required for question type",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const updateTaskSchema = z
  .object({
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
    type: z
      .enum(["image", "question"], {
        error: "Type must be image or question",
      })
      .optional(),
    is_active: z.coerce.boolean().optional(),
    questions: questionMapSchema.optional(),
  });

const getAllTasksSchema = z.object({
  type: z.enum(["image", "question"]).optional(),
});

const recentTaskSchema = z.object({
  type: z.enum(["image", "question"], {
    error: "Type must be image or question",
  }),
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
