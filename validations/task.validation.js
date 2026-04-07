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

<<<<<<< HEAD
const getAllTasksSchema = z.object({
  type: z.enum(["image", "question"]).optional(),
});

module.exports = { createTaskSchema, getAllTasksSchema };
=======
module.exports = { createTaskSchema };
>>>>>>> 5c1ee93a6d068a3bff3b4184ef7f2d47e8e8cbda
