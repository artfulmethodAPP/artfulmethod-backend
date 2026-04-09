const { z } = require("zod");

const saveTranscriptSchema = z.object({
  text: z
    .string({ error: "text is required" })
    .trim()
    .min(1, "text is required")
    .max(50000, "text must be 50000 characters or less"),
  duration: z.coerce
    .number()
    .int("duration must be an integer")
    .nonnegative("duration must be 0 or greater"),
  language: z
    .string({ error: "language is required" })
    .trim()
    .min(2, "language is required")
    .max(20, "language must be 20 characters or less"),
  wordCount: z.coerce
    .number()
    .int("wordCount must be an integer")
    .nonnegative("wordCount must be 0 or greater")
    .optional(),
});

module.exports = {
  saveTranscriptSchema,
};
