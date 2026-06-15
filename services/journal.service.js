"use strict";

const { UserLessonAttempt, LessonContent, UserPromptResponse, CourseLesson } = require("../models");
const { getPresignedUrl } = require("./s3.service");

/**
 * Returns all completed lesson sessions for a user.
 * Each entry includes artwork info, artwork image URL, and all prompt responses.
 */
const getJournalEntries = async (userId) => {
  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, status: "completed" },
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
      }))[0];

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
    where: { id: entryId, user_id: userId, status: "completed" },
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

module.exports = { getJournalEntries, getJournalEntryById };
