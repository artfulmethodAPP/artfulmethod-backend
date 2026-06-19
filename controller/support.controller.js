"use strict";

const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const { submitContactMessage } = require("../services/support.service");

/**
 * POST /api/v1/support/contact
 * Logged-in user sends a "Get in touch" message.
 */
const contact = asyncHandler(async (req, res) => {
  const result = await submitContactMessage(req.user.id, req.body.message);
  return sendSuccess(res, {
    message:
      "Thanks you, we’ve received your message! We may follow up by email",
    data: result,
  });
});

module.exports = { contact };
