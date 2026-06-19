const { z } = require("zod");

// "Get in touch" message body.
const contactSchema = z.object({
  message: z
    .string({ error: "message is required" })
    .trim()
    .min(1, "message is required")
    .max(5000, "message must be 5000 characters or less"),
});

module.exports = { contactSchema };
