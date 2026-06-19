"use strict";

const { User } = require("../models");
const AppError = require("../utils/app-error");
const { sendContactEmail } = require("./email.service");

/**
 * Handle a "Get in touch" submission: append the message to the user's feedback
 * history and email the support inbox. The email is fire-and-forget — the
 * submission is saved regardless, so a mail failure doesn't fail the request.
 */
const submitContactMessage = async (userId, message) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "feedback"],
  });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  const entry = { message: message.trim(), time: new Date().toISOString() };

  // Append to the existing feedback array (defaults to [] for users with none).
  const feedback = Array.isArray(user.feedback) ? [...user.feedback, entry] : [entry];
  await user.update({ feedback });

  // Email the support inbox — non-fatal, handled inside sendContactEmail.
  sendContactEmail({
    userId: user.id,
    fromName: user.name,
    fromEmail: user.email,
    message: entry.message,
  });

  return { submitted_at: entry.time };
};

module.exports = { submitContactMessage };
