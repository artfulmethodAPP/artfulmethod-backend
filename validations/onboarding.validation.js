const { z } = require("zod");

// =====================
// Create Question Schema
// =====================
const createOnboardingQuestionSchema = z.object({
  key: z
    .string({ error: "Key is required" })
    .min(1, "Key cannot be empty")
    .max(100),

  question_text: z
    .string({ error: "Question text is required" })
    .min(1, "Question text cannot be empty"),

  options: z.array(z.string()).optional(),
});

// =====================
// Update Question Schema
// =====================
const updateOnboardingQuestionSchema = z
  .object({
    key: z.string().min(1).max(100).optional(),
    question_text: z.string().min(1).optional(),
    options: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

// =====================
// Params Schema
// =====================
const onboardingParamsSchema = z.object({
  id: z.coerce.number().int().positive("Invalid ID"),
});

module.exports = {
  createOnboardingQuestionSchema,
  updateOnboardingQuestionSchema,
  onboardingParamsSchema,
};
