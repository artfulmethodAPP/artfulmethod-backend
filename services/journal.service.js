"use strict";

const { UserLessonAttempt, UserPromptResponse, LessonContent, CourseLesson, sequelize } = require("../models");
const { getPresignedUrl } = require("./s3.service");
const AppError = require("../utils/app-error");

/**
 * Returns all completed lesson sessions for a user.
 * Each entry includes artwork info, artwork image URL, and all prompt responses.
 */
const getJournalEntries = async (userId) => {
  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, status: "completed", deleted_at: null },
    order: [["completed_at", "DESC"]],
    include: [
      {
        model: CourseLesson,
        attributes: ["id"],
        include: [
          {
            model: LessonContent,
            attributes: ["artwork_title", "image_s3_key"],
          },
        ],
      },
      {
        model: UserPromptResponse,
        attributes: ["id", "prompt_number", "transcript_text"],
        separate: true,
        order: [["prompt_number", "ASC"]],
      },
    ],
  });

  return Promise.all(
    attempts.map(async (attempt) => {
      const content = attempt.CourseLesson?.LessonContent;

      const artwork_image_url = content?.image_s3_key
        ? await getPresignedUrl(content.image_s3_key)
        : null;

      const prompt_responses = (attempt.UserPromptResponses || []).map((r) => ({
        id:               r.id,
        prompt_number:    r.prompt_number,
        transcript_text:  r.transcript_text,
      }));

      return {
        id:                attempt.id,
        course_id:         attempt.course_id,
        lesson_id:         attempt.course_lesson_id,
        lesson_title:      attempt.CourseLesson?.title || null,
        completed_at:      attempt.completed_at,
        artwork_title:     content?.artwork_title  || null,
        artwork_image_url,
        prompt_responses,
      };
    }),
  );
};

/**
 * Returns a single journal entry for the authenticated user.
 * Includes full artwork info (title, artist, years, image) and all prompt responses.
 */
const getJournalEntryById = async (userId, entryId) => {
  const attempt = await UserLessonAttempt.findOne({
    where: { id: entryId, user_id: userId, status: "completed", deleted_at: null },
    include: [
      {
        model: CourseLesson,
        attributes: ["id", "title"],
        include: [
          {
            model: LessonContent,
            attributes: ["artwork_title", "artist_name", "years", "artwork_info", "image_s3_key"],
          },
        ],
      },
      {
        model: UserPromptResponse,
        attributes: ["id", "prompt_number", "transcript_text", "submitted_at"],
        separate: true,
        order: [["prompt_number", "ASC"]],
      },
    ],
  });

  if (!attempt) return null;

  const content = attempt.CourseLesson?.LessonContent;

  const artwork_image_url = content?.image_s3_key
    ? await getPresignedUrl(content.image_s3_key)
    : null;

  return {
    id:               attempt.id,
    course_id:        attempt.course_id,
    lesson_id:        attempt.course_lesson_id,
    lesson_title:     attempt.CourseLesson?.title || null,
    completed_at:     attempt.completed_at,
    artwork_title:    content?.artwork_title || null,
    artist_name:      content?.artist_name   || null,
    years:            content?.years         || null,
    artwork_info:     content?.artwork_info  || null,
    artwork_image_url,
    prompt_responses: (attempt.UserPromptResponses || []).map((r) => ({
      id:              r.id,
      prompt_number:   r.prompt_number,
      transcript_text: r.transcript_text,
      submitted_at:    r.submitted_at,
    })),
  };
};

/**
 * Updates the transcript text of one or more prompt responses for a journal entry.
 * Verifies the entry belongs to the user, and that every submitted prompt response
 * id belongs to that entry, before applying updates inside a transaction.
 * Returns the refreshed entry.
 */
const updateEntryPromptResponses = async (userId, entryId, promptResponses) => {
  const attempt = await UserLessonAttempt.findOne({
    where: { id: entryId, user_id: userId, status: "completed", deleted_at: null },
    attributes: ["id"],
  });

  if (!attempt) {
    throw new AppError("Journal entry not found", 404, "NOT_FOUND");
  }

  // Fetch the prompt responses the client wants to update, scoped to this entry,
  // so we never touch responses belonging to another entry/user.
  const ids = promptResponses.map((r) => r.id);
  const existing = await UserPromptResponse.findAll({
    where: { id: ids, user_lesson_attempt_id: entryId },
    attributes: ["id"],
  });

  const existingIds = new Set(existing.map((r) => r.id));
  const invalidIds = ids.filter((id) => !existingIds.has(id));

  if (invalidIds.length > 0) {
    throw new AppError(
      `Prompt response(s) not found for this entry: ${invalidIds.join(", ")}`,
      404,
      "NOT_FOUND",
    );
  }

  await sequelize.transaction(async (transaction) => {
    await Promise.all(
      promptResponses.map((r) =>
        UserPromptResponse.update(
          { transcript_text: r.transcript_text },
          { where: { id: r.id, user_lesson_attempt_id: entryId }, transaction },
        ),
      ),
    );
  });

  const updated = await UserPromptResponse.findAll({
    where: { user_lesson_attempt_id: entryId },
    attributes: ["id", "prompt_number", "transcript_text"],
    order: [["prompt_number", "ASC"]],
  });

  return updated.map((r) => ({
    id: r.id,
    prompt_number: r.prompt_number,
    transcript_text: r.transcript_text,
  }));
};

/**
 * Soft-deletes a single journal entry for the authenticated user.
 * Sets deleted_at on the UserLessonAttempt so it disappears from the journal,
 * while leaving the attempt intact for course progress, streaks, perception,
 * the GiR course report, and the sequential lesson-unlock chain.
 */
const deleteEntry = async (userId, entryId) => {
  const attempt = await UserLessonAttempt.findOne({
    where: { id: entryId, user_id: userId, status: "completed", deleted_at: null },
    attributes: ["id"],
  });

  if (!attempt) {
    throw new AppError("Journal entry not found", 404, "NOT_FOUND");
  }

  await attempt.update({ deleted_at: new Date() });

  return { id: attempt.id };
};

module.exports = {
  getJournalEntries,
  getJournalEntryById,
  updateEntryPromptResponses,
  deleteEntry,
};
