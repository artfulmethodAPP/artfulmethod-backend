const { z } = require("zod");

// Validates the :id path param (the UserLessonAttempt / journal entry id)
const entryIdParamSchema = z.object({
  id: z.coerce
    .number({ error: "id must be a number" })
    .int("id must be an integer")
    .positive("id must be a positive integer"),
});

// Validates the body for updating transcripts of the entry's prompt responses.
// Frontend sends an array of { id, transcript_text } — one item per prompt response.
const updatePromptResponsesSchema = z.object({
  prompt_responses: z
    .array(
      z.object({
        id: z.coerce
          .number({ error: "prompt response id must be a number" })
          .int("prompt response id must be an integer")
          .positive("prompt response id must be a positive integer"),
        transcript_text: z
          .string({ error: "transcript_text is required" })
          .trim()
          .min(1, "transcript_text is required")
          .max(50000, "transcript_text must be 50000 characters or less"),
      }),
      { error: "prompt_responses must be an array" },
    )
    .min(1, "prompt_responses must contain at least one item"),
});

module.exports = {
  entryIdParamSchema,
  updatePromptResponsesSchema,
};
