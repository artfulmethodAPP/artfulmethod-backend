const { z } = require("zod");

const saveTranscriptSchema = z.object({
  text: z
    .string({ error: "text is required" })
    .trim()
    .min(1, "text is required")
    .max(50000, "text must be 50000 characters or less"),
  duration: z.coerce
    .number()
    .nonnegative("duration must be 0 or greater")
    .optional(),
  language: z
    .string()
    .trim()
    .min(2, "language must be at least 2 characters")
    .max(20, "language must be 20 characters or less")
    .optional(),
  wordCount: z.coerce
    .number()
    .int("wordCount must be an integer")
    .nonnegative("wordCount must be 0 or greater")
    .optional(),
});

module.exports = {
  saveTranscriptSchema,
};
