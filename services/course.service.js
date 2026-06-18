const {
  Course,
  CourseLesson,
  LessonContent,
  UserCourseProgress,
  UserLessonAttempt,
  User,
  AiReport,
} = require("../models");
const AppError = require("../utils/app-error");
const { getPresignedUrl } = require("./s3.service");
const {
  ARCHETYPE_SUBTITLES,
  ARCHETYPE_DESCRIPTIONS,
  FIXED_INTRO,
} = require("./archetype.service");

// ─── Courses ─────────────────────────────────────────────────────────────────

const createCourse = async (data) => {
  const { name, subtitle, description, image_s3_key, sort_order } = data;

  const course = await Course.create({
    name,
    subtitle,
    description,
    image_s3_key,
    sort_order: sort_order ?? 0,
    is_active: true,
  });

  // Strip S3 key — even admin responses don't expose internal keys
  const { image_s3_key: _ik, ...plain } = course.toJSON();
  return plain;
};

const getAllCourses = async (userId) => {
  const { sequelize } = require("../models");
  const { QueryTypes } = require("sequelize");

  // 4 parallel queries — no N+1
  const [user, rawCourses, allProgress, lessonCounts] = await Promise.all([
    User.findByPk(userId, { attributes: ["id", "home_base_course_id"] }),
    Course.findAll({
      where: { is_active: true },
      order: [["sort_order", "ASC"]],
    }),
    UserCourseProgress.findAll({ where: { user_id: userId } }),
    sequelize.query(
      "SELECT course_id, COUNT(*) AS total FROM Course_Lessons WHERE is_active = true GROUP BY course_id",
      { type: QueryTypes.SELECT },
    ),
  ]);
  // Build a map of course_id → total active lessons
  const lessonCountMap = new Map(
    lessonCounts.map((r) => [r.course_id, Number(r.total)]),
  );
  const homeBaseCourseId = user ? user.home_base_course_id : null;
  const progressMap = new Map(allProgress.map((p) => [p.course_id, p]));

  // Reorder: home base course first, then the rest in sort_order
  const courses = [...rawCourses];
  if (homeBaseCourseId) {
    const homeIndex = courses.findIndex((c) => c.id === homeBaseCourseId);
    if (homeIndex > 0) {
      const [homeCourse] = courses.splice(homeIndex, 1);
      courses.unshift(homeCourse);
    }
  }

  const result = await Promise.all(
    courses.map(async (c) => {
      const { image_s3_key, ...plain } = c.toJSON();
      plain.image_url = image_s3_key
        ? await getPresignedUrl(image_s3_key)
        : null;
      plain.is_home_base = c.id === homeBaseCourseId;

      const progress = progressMap.get(c.id);

      // Courses are no longer locked — any course can be started at any time.
      plain.user_progress = {
        status: progress ? progress.status : "not_started",
        lessons_completed: progress ? progress.lessons_completed : 0,
        total_lessons: lessonCountMap.get(c.id) ?? 0,
      };

      return plain;
    }),
  );

  return result;
};

const getCourseById = async (courseId, userId) => {
  const course = await Course.findByPk(courseId, {
    include: [{ model: CourseLesson, order: [["sort_order", "ASC"]] }],
  });

  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  // Courses are no longer locked — any course can be accessed at any time.
  const { image_s3_key, CourseLessons: lessons, ...plain } = course.toJSON();
  plain.image_url = image_s3_key ? await getPresignedUrl(image_s3_key) : null;

  // Fetch all this user's attempts for this course in one query
  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, course_id: courseId },
  });
  const attemptMap = new Map(attempts.map((a) => [a.course_lesson_id, a]));

  // Attach per-lesson status using sequential lock logic
  plain.lessons = (lessons || []).map((lesson, index) => {
    const attempt = attemptMap.get(lesson.id);
    const isFirst = index === 0;

    let status;
    if (attempt?.status === "completed") {
      status = "completed";
    } else if (!isFirst) {
      const prevLesson = lessons[index - 1];
      const prevAttempt = attemptMap.get(prevLesson.id);
      const prevCompleted = prevAttempt?.status === "completed";
      if (!prevCompleted) {
        status = "locked";
      } else {
        status = attempt ? "in_progress" : "not_started";
      }
    } else {
      status = attempt ? "in_progress" : "not_started";
    }

    return {
      id: lesson.id,
      title: lesson.title,
      sort_order: lesson.sort_order,
      is_active: lesson.is_active,
      status,
      attempt_id: attempt ? attempt.id : null,
    };
  });

  return plain;
};

const updateCourse = async (courseId, data) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const allowed = [
    "name",
    "subtitle",
    "description",
    "image_s3_key",
    "sort_order",
    "is_active",
  ];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  await course.update(updates);
  const { image_s3_key: _ik, ...plain } = course.toJSON();
  return plain;
};

// ─── Lessons ─────────────────────────────────────────────────────────────────

const createLesson = async (courseId, data) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const { title, sort_order } = data;

  const lesson = await CourseLesson.create({
    course_id: courseId,
    title,
    sort_order: sort_order ?? 0,
    is_active: true,
  });

  return lesson;
};

const getLessonsByCourse = async (courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");

  const lessons = await CourseLesson.findAll({
    where: { course_id: courseId },
    order: [["sort_order", "ASC"]],
  });

  return lessons;
};

const updateLesson = async (lessonId, data) => {
  const lesson = await CourseLesson.findByPk(lessonId);
  if (!lesson) throw new AppError("Session not found", 404, "NOT_FOUND");

  const allowed = ["title", "sort_order", "is_active"];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  await lesson.update(updates);
  return lesson;
};

// ─── Lesson Content ───────────────────────────────────────────────────────────

const createLessonContent = async (lessonId, data) => {
  const lesson = await CourseLesson.findByPk(lessonId);
  if (!lesson) throw new AppError("Session not found", 404, "NOT_FOUND");

  const existing = await LessonContent.findOne({
    where: { course_lesson_id: lessonId },
  });
  if (existing)
    throw new AppError(
      "Session content already exists for this session. Use update instead.",
      409,
      "CONFLICT",
    );

  const {
    artwork_title,
    artwork_info,
    artist_name,
    years,
    prompts_json,
    image_s3_key,
  } = data;

  if (!image_s3_key) {
    throw new AppError("image_s3_key is required", 400, "VALIDATION_ERROR");
  }

  const content = await LessonContent.create({
    course_lesson_id: lessonId,
    artwork_title,
    artwork_info,
    artist_name,
    years,
    prompts_json,
    image_s3_key,
  });

  const { image_s3_key: _ik, ...plain } = content.toJSON();
  return plain;
};

const getLessonContent = async (lessonId, userId) => {
  const lesson = await CourseLesson.findByPk(lessonId);

  if (!lesson) throw new AppError("Session not found", 404, "NOT_FOUND");

  const courseId = lesson.course_id;

  // Courses are no longer locked — any course can be accessed at any time.
  // Lessons remain sequential within a course (lesson N requires N-1 completed).

  // ── Sequential lesson lock ─────────────────────────────────────────────────
  if (lesson.sort_order > 1) {
    const prevLesson = await CourseLesson.findOne({
      where: { course_id: courseId, sort_order: lesson.sort_order - 1 },
    });
    if (prevLesson) {
      const prevAttempt = await UserLessonAttempt.findOne({
        where: { user_id: userId, course_lesson_id: prevLesson.id },
      });
      if (!prevAttempt || prevAttempt.status !== "completed") {
        throw new AppError("This lesson is locked", 403, "LESSON_LOCKED");
      }
    }
  }

  const content = await LessonContent.findOne({
    where: { course_lesson_id: lessonId },
  });
  if (!content)
    throw new AppError("Session content not found", 404, "NOT_FOUND");

  const { image_s3_key, ...plain } = content.toJSON();
  plain.image_url = image_s3_key ? await getPresignedUrl(image_s3_key) : null;

  return plain;
};

const updateLessonContent = async (lessonId, data) => {
  const content = await LessonContent.findOne({
    where: { course_lesson_id: lessonId },
  });
  if (!content)
    throw new AppError("Session content not found", 404, "NOT_FOUND");

  const allowed = [
    "artwork_title",
    "artwork_info",
    "artist_name",
    "years",
    "prompts_json",
    "image_s3_key",
  ];
  const updates = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  await content.update(updates);
  const { image_s3_key: _ik, ...plain } = content.toJSON();
  return plain;
};

// ─── Start Lesson (with cross-course + sequential lesson lock) ───────────────

const startLesson = async (userId, courseId, lessonId) => {
  // Validate the course exists and the lesson belongs to it.
  const [course, lesson] = await Promise.all([
    Course.findOne({ where: { id: courseId, is_active: true } }),
    CourseLesson.findOne({ where: { id: lessonId, course_id: courseId } }),
  ]);

  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");
  if (!lesson)
    throw new AppError("Session not found in this course", 404, "NOT_FOUND");

  // Courses are no longer locked — any course can be started at any time.
  // Lessons remain sequential within a course (lesson N requires N-1 completed).

  // ── Sequential lesson lock ───────────────────────────────────────────────────
  // Lesson at sort_order 1 is always unlocked within its course.
  // Lesson N requires lesson N-1 (by sort_order) to be completed.
  if (lesson.sort_order > 1) {
    const prevLesson = await CourseLesson.findOne({
      where: { course_id: courseId, sort_order: lesson.sort_order - 1 },
    });
    if (prevLesson) {
      const prevAttempt = await UserLessonAttempt.findOne({
        where: { user_id: userId, course_lesson_id: prevLesson.id },
      });
      if (!prevAttempt || prevAttempt.status !== "completed") {
        throw new AppError(
          "You must complete the previous lesson before starting this one",
          403,
          "LESSON_LOCKED",
        );
      }
    }
  }

  // Upsert UserCourseProgress (created on first lesson of each course)
  await UserCourseProgress.findOrCreate({
    where: { user_id: userId, course_id: courseId },
    defaults: { lessons_completed: 0, status: "in_progress" },
  });

  // Upsert UserLessonAttempt (idempotent — returns existing if already started)
  const [attempt] = await UserLessonAttempt.findOrCreate({
    where: { user_id: userId, course_lesson_id: lessonId },
    defaults: { course_id: courseId, status: "in_progress" },
  });

  // Strip internal S3 keys — never expose these to end users
  const {
    report_s3_key: _rk,
    report_json_s3_key: _rjk,
    ...attemptPlain
  } = attempt.toJSON();
  return attemptPlain;
};

// ─── Transcribe Lesson Prompts (API 1 of 2) ──────────────────────────────────
//
// Handles the slow, external-API part of a session: transcribe each audio prompt
// via ElevenLabs and upload the audio to S3. Saves the resulting transcripts as
// UserPromptResponse rows and RETURNS them so the UI can show the "edit your
// transcript" screen. Does NOT run the archetype analysis — that is the separate
// /complete step, which keeps the report request fast and avoids gateway timeouts.
//
// prompts = [
//   { promptNumber: 1, file: <multerMemoryFile|null>, text: <string|null> },
//   ...
// ]  — each prompt independently audio (transcribe) or text (used directly).
//
// S3 audio key pattern (searchable by user / lesson / attempt / prompt):
//   courses/audio/user_{userId}/lesson_{lessonId}/attempt_{attemptId}/prompt_{n}.<ext>
//
const transcribeLessonPrompts = async (attemptId, userId, { prompts = [] } = {}) => {
  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  const s3 = require("../config/s3.config");
  const axios = require("axios");
  const FormData = require("form-data");
  const path = require("path");
  const { UserPromptResponse } = require("../models");

  // Validate: must have exactly 3 prompts, each with either a file or text
  if (!Array.isArray(prompts) || prompts.length !== 3) {
    throw new AppError(
      "Exactly 3 prompt responses are required",
      400,
      "VALIDATION_ERROR",
    );
  }
  for (const p of prompts) {
    if (!p.file && !p.text) {
      throw new AppError(
        `Prompt ${p.promptNumber} requires either an audio file (audio_${p.promptNumber}) or text (text_${p.promptNumber})`,
        400,
        "VALIDATION_ERROR",
      );
    }
  }

  const attempt = await UserLessonAttempt.findOne({
    where: { id: attemptId, user_id: userId },
  });
  if (!attempt)
    throw new AppError("Session attempt not found", 404, "NOT_FOUND");
  if (attempt.status === "completed")
    throw new AppError("Session already completed", 409, "CONFLICT");

  const lessonId = attempt.course_lesson_id;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  const transcribeFile = async (file) => {
    if (!apiKey)
      throw new AppError(
        "ElevenLabs API key not configured",
        500,
        "ELEVENLABS_NOT_CONFIGURED",
      );
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname || "audio.webm",
      contentType: file.mimetype,
    });
    formData.append("model_id", "scribe_v1");
    const res = await axios
      .post("https://api.elevenlabs.io/v1/speech-to-text", formData, {
        headers: { ...formData.getHeaders(), "xi-api-key": apiKey },
      })
      .catch((err) => {
        if (err.response?.status === 401)
          throw new AppError(
            "ElevenLabs API key invalid",
            500,
            "ELEVENLABS_NOT_CONFIGURED",
          );
        throw new AppError(
          err.response?.data?.detail?.message ||
            "ElevenLabs transcription failed",
          500,
          "TRANSCRIPTION_FAILED",
        );
      });
    return res.data.text || "";
  };

  // S3 audio upload helper — clean, searchable key
  const uploadAudio = async (file, promptNumber) => {
    const ext =
      path.extname(file.originalname || ".webm").replace(/^\./, "") || "webm";
    const key = `courses/audio/user_${userId}/lesson_${lessonId}/attempt_${attemptId}/prompt_${promptNumber}.${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return key;
  };

  // Process all 3 prompts in parallel — each independently audio or text
  const promptResults = await Promise.all(
    prompts.map(async ({ promptNumber, file, text }) => {
      if (file) {
        const [transcript, audioKey] = await Promise.all([
          transcribeFile(file),
          uploadAudio(file, promptNumber),
        ]);
        return { promptNumber, transcript, audioKey };
      }
      return { promptNumber, transcript: text.trim(), audioKey: null };
    }),
  );

  promptResults.sort((a, b) => a.promptNumber - b.promptNumber);

  // Save prompt responses (upsert by attempt + prompt_number) so the transcripts
  // are persisted even before the user finishes editing / completing.
  await Promise.all(
    promptResults.map(({ promptNumber, transcript, audioKey }) =>
      UserPromptResponse.upsert({
        user_lesson_attempt_id: attemptId,
        prompt_number: promptNumber,
        transcript_text: transcript,
        audio_s3_key: audioKey,
        submitted_at: new Date(),
      }),
    ),
  );

  // Return the transcripts for the "edit your transcript" screen.
  return {
    attempt_id: attempt.id,
    prompts: promptResults.map(({ promptNumber, transcript }) => ({
      prompt_number: promptNumber,
      transcript_text: transcript,
    })),
  };
};

// ─── Complete Lesson (API 2 of 2) — analyze final transcripts, micro-report ──
//
// Lightweight: receives the 3 final (possibly edited) transcripts as text, runs
// the Session Read archetype analysis, and generates + caches the micro-report.
// No audio / ElevenLabs here, so the request stays well under any gateway timeout.
//
// prompts = [ { promptNumber: 1, text: "..." }, ... ]  (exactly 3, text required)
//
const completeLesson = async (attemptId, userId, { prompts = [] } = {}) => {
  const { analyzeLessonArchetype } = require("./archetype.service");
  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  const { Op } = require("sequelize");
  const { randomUUID } = require("crypto");
  const s3 = require("../config/s3.config");
  const { UserPromptResponse } = require("../models");

  // Validate: exactly 3 prompts, each with non-empty text
  if (!Array.isArray(prompts) || prompts.length !== 3) {
    throw new AppError(
      "Exactly 3 prompt responses are required",
      400,
      "VALIDATION_ERROR",
    );
  }
  for (const p of prompts) {
    if (!p.text || !p.text.trim()) {
      throw new AppError(
        `Prompt ${p.promptNumber} requires text (text_${p.promptNumber})`,
        400,
        "VALIDATION_ERROR",
      );
    }
  }

  // 1. Load + validate attempt
  const attempt = await UserLessonAttempt.findOne({
    where: { id: attemptId, user_id: userId },
  });
  if (!attempt)
    throw new AppError("Session attempt not found", 404, "NOT_FOUND");
  if (attempt.status === "completed")
    throw new AppError("Session already completed", 409, "CONFLICT");

  const lessonId = attempt.course_lesson_id;

  // 2. Persist the final (edited) transcripts. Updating (not upserting) the
  //    existing row leaves any audio captured by /transcribe untouched; if the
  //    row doesn't exist yet, create a text-only one.
  const promptResults = [...prompts]
    .map((p) => ({ promptNumber: p.promptNumber, transcript: p.text.trim() }))
    .sort((a, b) => a.promptNumber - b.promptNumber);

  const transcripts = promptResults.map((r) => r.transcript);

  await Promise.all(
    promptResults.map(async ({ promptNumber, transcript }) => {
      const [count] = await UserPromptResponse.update(
        { transcript_text: transcript, submitted_at: new Date() },
        {
          where: {
            user_lesson_attempt_id: attemptId,
            prompt_number: promptNumber,
          },
        },
      );
      if (count === 0) {
        await UserPromptResponse.create({
          user_lesson_attempt_id: attemptId,
          prompt_number: promptNumber,
          transcript_text: transcript,
          submitted_at: new Date(),
        });
      }
    }),
  );

  // 3. Run lesson Session Read analysis — passes all 3 transcripts separately
  const analysisResult = await analyzeLessonArchetype({ transcripts });

  // 3b. Input Safeguard (Artful Method Section 5): if the transcript is missing,
  //     too short, or out of scope, the report protocol is suspended. The attempt
  //     is left un-completed so the participant can retry, and the exact notice
  //     is returned for the client to surface verbatim.
  if (analysisResult.rejected) {
    return {
      attempt_id: attempt.id,
      rejected: true,
      reason: analysisResult.notice.code,
      notice_title: analysisResult.notice.notice_title,
      notice_message: analysisResult.notice.notice_message,
    };
  }

  // The Session Read (Report Type 2) is intentionally lightweight: dominant
  // archetype + a short session insight, ending with the fixed sign-off. It
  // excludes quotes, deep analysis, expansion prompts, and commentary blocks.
  // It is returned inline in the response and cached as JSON to S3 (no PDF).
  const jsonKey = `courses/reports/json/${randomUUID()}.json`;

  // Fetch the lesson's position in the course to decide the closing sign-off.
  const coverLesson = await CourseLesson.findByPk(lessonId, {
    attributes: ["title", "sort_order"],
  });

  // On the final lesson of the course there is no "next session", so the
  // forward-looking sign-off is replaced with a course-completion line. A lesson
  // is last when no other active lesson in the same course has a higher
  // sort_order.
  const laterLessonCount = await CourseLesson.count({
    where: {
      course_id: attempt.course_id,
      is_active: true,
      sort_order: { [Op.gt]: coverLesson?.sort_order ?? 0 },
    },
  });
  if (laterLessonCount === 0) {
    analysisResult.signoff =
      "You have completed every session in this course. Well done on seeing it through to the end.";
  }

  // Stringify AFTER the possible sign-off override so the persisted JSON and
  // the DB report_json carry the same closing line.
  const jsonStr = JSON.stringify(analysisResult);

  // 4. Cache the Session Read JSON to S3 (no PDF — the report is returned inline
  //    in the response and re-fetchable via getLessonReport).
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: jsonKey,
      Body: jsonStr,
      ContentType: "application/json",
    }),
  );

  // 5. Mark attempt completed, store JSON key + JSON in DB
  await attempt.update({
    status: "completed",
    completed_at: new Date(),
    report_json_s3_key: jsonKey,
    report_json: analysisResult,
  });

  // 6. Increment lessons_completed on UserCourseProgress + fetch total lesson count
  const [, totalLessons] = await Promise.all([
    UserCourseProgress.increment("lessons_completed", {
      where: { user_id: userId, course_id: attempt.course_id },
    }),
    CourseLesson.count({ where: { course_id: attempt.course_id, is_active: true } }),
  ]);

  // 6b. Auto-complete the course if all lessons are now done
  const updatedProgress = await UserCourseProgress.findOne({
    where: { user_id: userId, course_id: attempt.course_id },
  });
  if (updatedProgress && updatedProgress.lessons_completed >= totalLessons) {
    await updatedProgress.update({ status: "completed", completed_at: new Date() });
  }

  // 7. Return the Session Read report inline in the response.
  return { attempt_id: attempt.id, status: "completed", report: analysisResult };
};

// ─── Get Lesson Report — return cached JSON from S3 + artwork image URL ──────

const getLessonReport = async (attemptId, userId) => {
  const attempt = await UserLessonAttempt.findOne({
    where: { id: attemptId, user_id: userId },
  });
  if (!attempt)
    throw new AppError("Session attempt not found", 404, "NOT_FOUND");
  if (attempt.status !== "completed")
    throw new AppError("Session not yet completed", 400, "NOT_COMPLETED");
  if (!attempt.report_json && !attempt.report_json_s3_key)
    throw new AppError("Report not available", 404, "NOT_FOUND");

  // Read from DB if available, fall back to S3 for older records
  let report;
  if (attempt.report_json) {
    report = attempt.report_json;
  } else {
    const { GetObjectCommand } = require("@aws-sdk/client-s3");
    const s3 = require("../config/s3.config");
    const s3Res = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: attempt.report_json_s3_key,
      }),
    );
    const chunks = [];
    for await (const chunk of s3Res.Body) chunks.push(chunk);
    report = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  }

  const lessonContent = await LessonContent.findOne({
    where: { course_lesson_id: attempt.course_lesson_id },
  });

  // Attach presigned artwork image URL so frontend can display the artwork alongside the report
  report.artwork_image_url = lessonContent?.image_s3_key
    ? await getPresignedUrl(lessonContent.image_s3_key)
    : null;

  // Attach artwork metadata (title, artist, info) for display above the report
  report.artwork = lessonContent
    ? {
        title: lessonContent.artwork_title ?? null,
        artist_name: lessonContent.artist_name ?? null,
        years: lessonContent.years ?? null,
        info: lessonContent.artwork_info ?? null,
      }
    : null;

  return report;
};

// ─── Course Report (Growth in Range) ─────────────────────────────────────────
//
// GET /api/v1/courses/:courseId/report
//
// Rules:
//   - All lessons in this course must be completed (status = 'completed')
//   - If course_report_s3_key already exists → return cached JSON from S3 (no Claude re-run)
//   - Otherwise → run GiR pipeline, store JSON + PDF to S3, cache the keys
//
const getCourseReport = async (courseId, userId) => {
  const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
  const { randomUUID } = require("crypto");
  const s3 = require("../config/s3.config");
  const { analyzeGrowthInRange } = require("./archetype.service");
  const { generateReportPdf, uploadReportPdfToS3 } = require("./pdf.service");
  const { UserPromptResponse } = require("../models");

  // The report JSON is cached, so artwork images are stored as S3 keys and the
  // presigned URL (1h expiry) is generated fresh on every read. Mutates the
  // report in place, adding `artwork_url` to each evidence item.
  const withArtworkUrls = async (report) => {
    const evidence = report?.report?.evidence;
    if (!Array.isArray(evidence)) return report;
    await Promise.all(
      evidence.map(async (e) => {
        e.artwork_url = e.artwork_image_s3_key
          ? await getPresignedUrl(e.artwork_image_s3_key)
          : null;
      }),
    );
    return report;
  };

  // Strip fields the client no longer needs. Applied at the API boundary so the
  // full data is still available for the PDF and for cached reports generated
  // before these fields were dropped.
  const stripUnusedFields = (report) => {
    if (!report) return report;
    delete report.range_modes;
    if (report.report) {
      delete report.report.how_you_see;
      delete report.report.emerging_perceptual_capacities;
    }
    return report;
  };

  // Recommend a course based on the user's first absent mode. Courses are named
  // "The {Archetype}" (e.g. "The Integrator"), so we match on that. Returns all
  // fields the recommendation card needs, with a fresh presigned image URL.
  const buildRecommendedCourse = async (report) => {
    const firstAbsent = report?.absent_modes?.[0] ?? null;
    if (!firstAbsent) return null;

    const recommended = await Course.findOne({
      where: { name: `The ${firstAbsent}`, is_active: true },
    });
    if (!recommended) return null;

    return {
      course_id: recommended.id,
      title: recommended.name,
      subtitle: recommended.subtitle,
      description: recommended.description,
      image_url: recommended.image_s3_key
        ? await getPresignedUrl(recommended.image_s3_key)
        : null,
    };
  };

  // 1. Load course + progress + user email in parallel
  const [course, progress, user] = await Promise.all([
    Course.findByPk(courseId),
    UserCourseProgress.findOne({
      where: { user_id: userId, course_id: courseId },
    }),
    User.findByPk(userId, { attributes: ["id", "email", "name"] }),
  ]);

  if (!course) throw new AppError("Course not found", 404, "NOT_FOUND");
  if (!progress)
    throw new AppError("You have not started this course", 400, "NOT_STARTED");
  if (progress.status !== "completed") {
    throw new AppError(
      "All lessons must be completed before the course report is available",
      403,
      "COURSE_NOT_COMPLETED",
    );
  }

  // 2. Cache hit — read from DB if available, fall back to S3 for older records
  if (progress.course_report_json || progress.course_report_s3_key) {
    let report;
    if (progress.course_report_json) {
      report = progress.course_report_json;
    } else {
      const s3Res = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET,
          Key: progress.course_report_s3_key,
        }),
      );
      const chunks = [];
      for await (const chunk of s3Res.Body) chunks.push(chunk);
      report = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
    }
    const pdf_url = progress.course_report_pdf_s3_key
      ? await getPresignedUrl(progress.course_report_pdf_s3_key)
      : null;
    await withArtworkUrls(report);
    const recommended_course = await buildRecommendedCourse(report);
    stripUnusedFields(report);
    return { report, pdf_url, prepared_for: user?.name ?? null, recommended_course };
  }

  // 3. Fetch all completed attempts for this course, including each lesson's
  //    artwork details so the report evidence can identify the artwork the user
  //    was viewing in that session ("See Artwork" modal).
  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, course_id: courseId, status: "completed" },
    order: [["course_lesson_id", "ASC"]],
    include: [
      {
        model: CourseLesson,
        attributes: ["id"],
        include: [
          {
            model: LessonContent,
            attributes: ["artwork_title", "artwork_info", "artist_name", "years", "image_s3_key"],
          },
        ],
      },
    ],
  });

  if (attempts.length === 0) {
    throw new AppError("No completed lessons found for this course", 400, "INCOMPLETE_LESSONS");
  }

  // 4. Load all prompt responses for all attempts in parallel
  const allResponses = await Promise.all(
    attempts.map((a) =>
      UserPromptResponse.findAll({
        where: { user_lesson_attempt_id: a.id },
        order: [["prompt_number", "ASC"]],
      }),
    ),
  );

  // 5. Build lesson transcripts — join 3 prompts per lesson with separator.
  //    Each lesson already has a dominant archetype stored from its own Session
  //    Read (report_json.archetype.name). We pass that through as precomputed_mode
  //    so the GiR home base agrees with the per-lesson reports instead of being
  //    re-scored with a different prompt.
  const lessons = attempts.map((attempt, idx) => {
    const responses = allResponses[idx] || [];
    const transcript = responses
      .filter((r) => r.transcript_text)
      .sort((a, b) => a.prompt_number - b.prompt_number)
      .map((r) => r.transcript_text)
      .join("\n\n---\n\n");
    const content = attempt.CourseLesson?.LessonContent;
    return {
      lesson_number: idx + 1,
      transcript_text: transcript,
      precomputed_mode: attempt.report_json?.archetype?.name ?? null,
      artwork_title: content?.artwork_title ?? null,
      artwork_info: content?.artwork_info ?? null,
      artist_name: content?.artist_name ?? null,
      years: content?.years ?? null,
      artwork_image_s3_key: content?.image_s3_key ?? null,
    };
  });

  // 6. Run GiR pipeline
  const girResult = await analyzeGrowthInRange({ lessons });

  // 6b. Input Safeguard (Artful Method Section 5): suspend the report and return
  //     the exact notice if the combined transcripts are missing or out of scope.
  if (girResult.rejected) {
    return {
      rejected: true,
      reason: girResult.notice.code,
      notice_title: girResult.notice.notice_title,
      notice_message: girResult.notice.notice_message,
    };
  }

  // 7. Store JSON + generate PDF in parallel.
  //    Growth in Range (Report Type 3) sections: II Fixed Intro, III Overview,
  //    IV Evidence Deep-Dive (per-session tracking line + quote + reflection),
  //    V Range Mapping (per-mode + Emerging Perceptual Capacities + absent),
  //    VI How Might This Show Up.
  const jsonKey = `courses/reports/gir/json/${randomUUID()}.json`;
  const jsonStr = JSON.stringify(girResult);

  // Section IV: each session block opens with its dominant-archetype tracking line.
  const evidenceSections = (girResult.report.evidence || []).map((e) => ({
    heading: `Session ${e.session_number ?? ""}: Dominant Archetype: ${e.dominant_archetype ?? ""}`.trim(),
    body: `"${e.quote}"\n\n${e.reflection}`,
  }));

  const [pdfBuffer] = await Promise.all([
    generateReportPdf({
      archetype: {
        name: `Growth in Range: ${girResult.home_base}`,
        subtitle: `Home base: ${girResult.home_base} · Range: ${girResult.range_modes.join(", ") || "none"}`,
      },
      participant: { name: user?.name },
      teaserCards: [],
      quotesAndMeanings: [],
      report: {
        intro: girResult.report.fixed_intro,
        sections: [
          { heading: "How You See", body: girResult.report.overview },
          ...evidenceSections,
          ...girResult.report.your_range.map((r) => ({
            heading: `Your Range: ${r.mode}`,
            body: r.paragraph,
          })),
          ...(girResult.report.emerging_perceptual_capacities
            ? [
                {
                  heading: "Emerging Perceptual Capacities",
                  body: girResult.report.emerging_perceptual_capacities,
                },
              ]
            : []),
          {
            heading: "Absent Modes",
            body: girResult.report.absent_modes_sentence,
          },
          {
            heading: "How might this show up?",
            body: girResult.report.how_might_this_show_up,
          },
        ],
      },
    }),
    s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: jsonKey,
        Body: jsonStr,
        ContentType: "application/json",
      }),
    ),
  ]);

  const pdfKey = await uploadReportPdfToS3(pdfBuffer);

  // 8. Cache keys + JSON on UserCourseProgress
  await progress.update({
    course_report_s3_key: jsonKey,
    course_report_pdf_s3_key: pdfKey,
    course_report_json: girResult,
  });

  const pdf_url = await getPresignedUrl(pdfKey);

  // 9. Send course report email with PDF attached — fire-and-forget (non-fatal)
  if (user?.email) {
    const { sendCourseReportEmail } = require("./email.service");
    sendCourseReportEmail({
      userId,
      email: user.email,
      courseName: course.name,
      pdfBuffer,
    });
  }

  await withArtworkUrls(girResult);
  const recommended_course = await buildRecommendedCourse(girResult);
  stripUnusedFields(girResult);
  return { report: girResult, pdf_url, prepared_for: user?.name ?? null, recommended_course };
};

const getCourseReportPdf = async (courseId, userId) => {
  const progress = await UserCourseProgress.findOne({
    where: { user_id: userId, course_id: courseId },
  });
  if (!progress)
    throw new AppError("Course progress not found", 404, "NOT_FOUND");
  if (progress.status !== "completed")
    throw new AppError("Course not yet completed", 400, "NOT_COMPLETED");
  if (!progress.course_report_pdf_s3_key)
    throw new AppError(
      "Course report PDF not yet generated. Call GET /report first",
      404,
      "NOT_FOUND",
    );

  const pdf_url = await getPresignedUrl(progress.course_report_pdf_s3_key);
  return { pdf_url };
};

// ─── Home Base Course Assignment ─────────────────────────────────────────────

const setHomeBaseCourse = async (userId, archetypeName) => {
  // Only set once — skip if already assigned
  const user = await User.findByPk(userId);
  if (!user || user.home_base_course_id) return;

  // Find the course whose name contains the archetype name (case-insensitive)
  const { Op } = require("sequelize");
  const course = await Course.findOne({
    where: { name: { [Op.like]: `%${archetypeName}%` } },
  });

  if (course) {
    await user.update({ home_base_course_id: course.id });
  }
};

// ─── Perception Dashboard ─────────────────────────────────────────────────────

const VALID_ARCHETYPES = ["Storyteller", "Framer", "Archivist", "Artist", "Integrator"];

const getPerceptionDashboard = async (userId) => {
  // The donut reflects BOTH the onboarding archetype assessment (Ai_Reports) and
  // every completed session report (UserLessonAttempt). Each report contributes
  // one count for its dominant archetype.
  const [attempts, onboardingReports] = await Promise.all([
    UserLessonAttempt.findAll({
      where: { user_id: userId, status: "completed" },
      attributes: ["report_json"],
    }),
    AiReport.findAll({
      where: { user_id: userId },
      attributes: ["report_json"],
    }),
  ]);

  const counts = { Storyteller: 0, Framer: 0, Archivist: 0, Artist: 0, Integrator: 0 };
  let total = 0;

  const tally = (name) => {
    if (name && counts[name] !== undefined) {
      counts[name]++;
      total++;
    }
  };

  // Session reports (Type 2)
  for (const attempt of attempts) {
    tally(attempt.report_json?.archetype?.name);
  }
  // Onboarding archetype reports (Type 1)
  for (const report of onboardingReports) {
    tally(report.report_json?.archetype?.name);
  }

  const MODE_LABELS = [
    "Your primary mode",
    "Accessible mode",
    "Developing",
    "Growing edge",
    "Next frontier",
  ];

  // Sort by raw count (used internally for ranking the mode tier). `count` is not
  // returned in the response; the frontend uses `percentage`.
  const sorted = VALID_ARCHETYPES.map((name) => ({
    name,
    subtitle: ARCHETYPE_SUBTITLES[name],
    count: counts[name],
    // Percentage is over the combined total (sessions + onboarding) so the donut
    // reflects both report types.
    percentage: total > 0 ? Math.round((counts[name] / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const archetypes = sorted.map((item, index) => ({
    name: item.name,
    subtitle: item.subtitle,
    percentage: item.percentage,
    mode: item.percentage === 0 ? "Emerging" : (MODE_LABELS[index] || "Emerging"),
  }));

  // Keep total_lessons_completed as the count of completed sessions only, so the
  // existing field stays accurate; the donut percentages use the combined total.
  const sessionsCompleted = attempts.filter(
    (a) => a.report_json?.archetype?.name,
  ).length;

  return { total_lessons_completed: sessionsCompleted, archetypes };
};

const getArchetypePerceptionReport = async (userId, archetype) => {
  if (!VALID_ARCHETYPES.includes(archetype)) {
    throw new AppError(
      `Invalid archetype. Must be one of: ${VALID_ARCHETYPES.join(", ")}`,
      400,
      "INVALID_ARCHETYPE",
    );
  }

  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, status: "completed" },
    attributes: ["id", "report_json"],
    include: [
      {
        model: CourseLesson,
        attributes: ["title"],
      },
    ],
  });

  // Filter to only attempts where this archetype was primary
  const matching = attempts.filter(
    (a) => a.report_json?.archetype?.name === archetype,
  );

  if (matching.length === 0) {
    throw new AppError(
      `No completed lessons found for archetype: ${archetype}`,
      404,
      "ARCHETYPE_NOT_FOUND",
    );
  }

  // Aggregate what_you_said quotes across all matching lessons
  const whatYouSaid = matching.map((attempt) => {
    const json = attempt.report_json;
    return {
      lesson_title: attempt.CourseLesson?.title || null,
      attempt_id: attempt.id,
      quotes: json?.promptInsights || [],
    };
  });

  // Parse ARCHETYPE_DESCRIPTIONS for static sections
  const descriptionText = ARCHETYPE_DESCRIPTIONS[archetype] || "";

  // Extract "Why this matters:" section
  const whyMatch = descriptionText.match(/Why this matters:([\s\S]*?)(?:Your growing edge:|Expanding Your Range:|$)/i);
  const whyThisMatters = whyMatch ? whyMatch[1].trim() : "";

  // Extract "Moving toward" entries for expanding_your_range
  const movingTowardMatches = [...descriptionText.matchAll(/Moving toward the ([^:]+):([\s\S]*?)(?=Moving toward|$)/g)];
  const movingToward = movingTowardMatches.map((m) => ({
    archetype: m[1].trim(),
    text: `Moving toward the ${m[1].trim()}: ${m[2].trim()}`,
  }));

  // First paragraph = aesthetic_archetype_portrait (everything before "What you do:")
  const portraitMatch = descriptionText.match(/^([\s\S]*?)(?:What you do:|$)/i);
  const primaryArchetypeDesc = portraitMatch ? portraitMatch[1].trim() : descriptionText;

  return {
    archetype: {
      name: archetype,
      subtitle: ARCHETYPE_SUBTITLES[archetype],
      description: primaryArchetypeDesc,
      lesson_count: matching.length,
    },
    sections: {
      aesthetic_archetype_portrait: FIXED_INTRO,
      primary_aesthetic_archetype: primaryArchetypeDesc,
      why_this_matters: whyThisMatters,
      what_you_said: whatYouSaid,
      expanding_your_range: {
        moving_toward: movingToward,
      },
    },
  };
};

// ─── Home Dashboard ───────────────────────────────────────────────────────────

const getHomeDashboard = async (userId) => {
  const [user, sessionsCompleted, aiReport] = await Promise.all([
    User.findByPk(userId, {
      attributes: ["id", "name", "streak_count", "longest_streak", "last_activity_date"],
    }),
    UserLessonAttempt.count({
      where: { user_id: userId, status: "completed" },
    }),
    // paranoid: false so soft-deleted reports are still seen here — the
    // assessment can be "completed" even if the user later deleted the report.
    AiReport.findOne({
      where: { user_id: userId },
      attributes: ["id", "deleted_at"],
      order: [["created_at", "DESC"]],
      paranoid: false,
    }),
  ]);

  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  // The assessment counts as completed if a report was ever generated, even if
  // it has since been soft-deleted. A deleted report is just no longer viewable.
  const assessmentCompleted = !!aiReport;
  const reportDeleted = !!(aiReport && aiReport.deleted_at);

  return {
    name: user.name,
    assessment_completed: assessmentCompleted,
    // Only expose an id the user can open; deleted reports return null.
    assessment_report_id: aiReport && !aiReport.deleted_at ? aiReport.id : null,
    assessment_report_deleted: reportDeleted,
    assessment_report_message: reportDeleted
      ? "Your archetype report has been deleted and is no longer available."
      : null,
    current_streak: user.streak_count,
    longest_streak: user.longest_streak,
    last_activity_date: user.last_activity_date,
    sessions_completed: sessionsCompleted,
  };
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  createLesson,
  getLessonsByCourse,
  updateLesson,
  createLessonContent,
  getLessonContent,
  updateLessonContent,
  startLesson,
  transcribeLessonPrompts,
  completeLesson,
  getLessonReport,
  getCourseReport,
  getCourseReportPdf,
  setHomeBaseCourse,
  getPerceptionDashboard,
  getArchetypePerceptionReport,
  getHomeDashboard,
};
