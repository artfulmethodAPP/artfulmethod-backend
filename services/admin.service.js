"use strict";

const { Op } = require("sequelize");
const {
  User,
  Course,
  CourseLesson,
  UserCourseProgress,
  UserLessonAttempt,
  UserPromptResponse,
} = require("../models");
const AppError = require("../utils/app-error");
const {
  ARCHETYPE_SUBTITLES,
} = require("./archetype.service");

// ─── Helper: find user or throw 404 ──────────────────────────────────────────

const findUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      "id", "name", "email", "role", "is_verified",
      "dob", "gender", "goal", "art_frequency", "source",
      "streak_count", "last_activity_date",
      "email_reports_enabled", "created_at", "deleted_at",
      "home_base_course_id",
    ],
    include: [
      {
        model: Course,
        as: "homeBaseCourse",
        attributes: ["id", "name"],
        required: false,
      },
    ],
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

// ─── Helper: perception summary ───────────────────────────────────────────────

const buildPerceptionSummary = (attempts) => {
  const VALID_ARCHETYPES = ["Storyteller", "Framer", "Archivist", "Artist", "Integrator"];
  const MODE_LABELS = [
    "Your primary mode",
    "Accessible mode",
    "Developing",
    "Growing edge",
    "Next frontier",
  ];

  const counts = { Storyteller: 0, Framer: 0, Archivist: 0, Artist: 0, Integrator: 0 };
  let total = 0;

  for (const attempt of attempts) {
    const name = attempt.report_json?.archetype?.name;
    if (name && counts[name] !== undefined) {
      counts[name]++;
      total++;
    }
  }

  const sorted = VALID_ARCHETYPES.map((name) => ({
    name,
    subtitle: ARCHETYPE_SUBTITLES[name],
    count: counts[name],
    percentage: total > 0 ? Math.round((counts[name] / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const archetypes = sorted.map((item, index) => ({
    ...item,
    mode: item.percentage === 0 ? "Emerging" : (MODE_LABELS[index] || "Emerging"),
  }));

  return { total_lessons_completed: total, archetypes };
};

// ─── 1. Users List ────────────────────────────────────────────────────────────

const getUsers = async ({ page = 1, limit = 20, search, status }) => {
  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status === "deleted") {
    where.deleted_at = { [Op.ne]: null };
  } else if (status === "active") {
    where.deleted_at = null;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: [
      "id", "name", "email", "role", "is_verified",
      "streak_count", "last_activity_date",
      "created_at", "deleted_at", "home_base_course_id",
    ],
    include: [
      {
        model: Course,
        as: "homeBaseCourse",
        attributes: ["id", "name"],
        required: false,
      },
      {
        model: UserCourseProgress,
        attributes: ["id", "status"],
        required: false,
      },
      {
        model: UserLessonAttempt,
        attributes: ["id", "status"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  const users = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    is_verified: u.is_verified,
    streak_count: u.streak_count,
    last_activity_date: u.last_activity_date,
    created_at: u.created_at,
    deleted_at: u.deleted_at,
    home_base_course: u.homeBaseCourse
      ? { id: u.homeBaseCourse.id, name: u.homeBaseCourse.name }
      : null,
    courses_completed: u.UserCourseProgresses
      ? u.UserCourseProgresses.filter((p) => p.status === "completed").length
      : 0,
    lessons_completed: u.UserLessonAttempts
      ? u.UserLessonAttempts.filter((a) => a.status === "completed").length
      : 0,
  }));

  return {
    users,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / limit),
    },
  };
};

// ─── 2. User Detail: Profile + Course Progress + Perception ──────────────────

const getUserDetail = async (userId) => {
  const user = await findUser(userId);

  // Course progress with course info
  const courseProgresses = await UserCourseProgress.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Course,
        attributes: ["id", "name", "subtitle"],
      },
    ],
    order: [["created_at", "ASC"]],
  });

  // Total lessons per course for progress bar
  const courseLessonCounts = await CourseLesson.findAll({
    attributes: [
      "course_id",
      [CourseLesson.sequelize.fn("COUNT", CourseLesson.sequelize.col("id")), "total"],
    ],
    where: { is_active: true },
    group: ["course_id"],
    raw: true,
  });
  const lessonCountMap = {};
  for (const row of courseLessonCounts) {
    lessonCountMap[row.course_id] = parseInt(row.total);
  }

  // Completed lesson attempts for perception summary
  const completedAttempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, status: "completed" },
    attributes: ["report_json"],
  });

  const course_progress = courseProgresses.map((p) => ({
    course: {
      id: p.Course.id,
      name: p.Course.name,
      subtitle: p.Course.subtitle,
    },
    status: p.status,
    lessons_completed: p.lessons_completed,
    total_lessons: lessonCountMap[p.course_id] || 0,
    completed_at: p.completed_at,
    course_report_json: p.status === "completed" ? p.course_report_json : null,
  }));

  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      dob: user.dob,
      gender: user.gender,
      goal: user.goal,
      art_frequency: user.art_frequency,
      source: user.source,
      streak_count: user.streak_count,
      last_activity_date: user.last_activity_date,
      email_reports_enabled: user.email_reports_enabled,
      created_at: user.created_at,
      deleted_at: user.deleted_at,
      home_base_course: user.homeBaseCourse
        ? { id: user.homeBaseCourse.id, name: user.homeBaseCourse.name }
        : null,
    },
    course_progress,
    perception: buildPerceptionSummary(completedAttempts),
  };
};

// ─── 3. User Lesson Reports ───────────────────────────────────────────────────

const getUserLessonReports = async (userId) => {
  await findUser(userId);

  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId, status: "completed" },
    attributes: [
      "id", "status", "completed_at", "course_id",
      "report_json", "report_s3_key",
    ],
    include: [
      {
        model: CourseLesson,
        attributes: ["id", "title"],
      },
      {
        model: Course,
        attributes: ["id", "name"],
      },
    ],
    order: [["completed_at", "ASC"]],
  });

  // Fetch all completed course progress records for this user
  const courseProgresses = await UserCourseProgress.findAll({
    where: { user_id: userId, status: "completed" },
    attributes: ["course_id", "completed_at", "course_report_json"],
  });
  const courseProgressMap = {};
  for (const p of courseProgresses) {
    courseProgressMap[p.course_id] = p;
  }

  // Group attempts by course
  const courseMap = {};
  for (const a of attempts) {
    const courseId = a.course_id;
    if (!courseMap[courseId]) {
      courseMap[courseId] = {
        course: { id: a.Course?.id || null, name: a.Course?.name || null },
        lessons: [],
      };
    }
    courseMap[courseId].lessons.push({
      attempt_id: a.id,
      lesson: { id: a.CourseLesson?.id || null, title: a.CourseLesson?.title || null },
      completed_at: a.completed_at,
      report: a.report_json
        ? {
            archetype: a.report_json.archetype || null,
            secondary_archetype: a.report_json.secondaryArchetype || null,
            what_shapes_your_thinking: a.report_json.archetypeNarrative || null,
            prompt_insights: a.report_json.promptInsights || [],
            moving_across_your_range: a.report_json.movingAcrossYourRange || null,
            how_might_this_growth_show_up: a.report_json.howMightThisGrowthShowUp || null,
          }
        : null,
    });
  }

  // Build final array — one entry per course
  const reports = Object.values(courseMap).map((group) => {
    const progress = courseProgressMap[group.course.id] || null;
    return {
      course: group.course,
      lessons: group.lessons,
      course_completion_report: progress
        ? {
            completed_at: progress.completed_at,
            course_report_json: progress.course_report_json || null,
          }
        : null,
    };
  });

  return { reports };
};

// ─── 4. User Transcripts ─────────────────────────────────────────────────────

const getUserTranscripts = async (userId) => {
  await findUser(userId);

  const attempts = await UserLessonAttempt.findAll({
    where: { user_id: userId },
    attributes: ["id"],
    include: [
      {
        model: CourseLesson,
        attributes: ["id", "title"],
      },
      {
        model: Course,
        attributes: ["id", "name"],
      },
      {
        model: UserPromptResponse,
        attributes: [
          "id", "prompt_number", "transcript_text",
          "submitted_at",
        ],
        required: false,
      },
    ],
    order: [
      ["id", "DESC"],
      [UserPromptResponse, "prompt_number", "ASC"],
    ],
  });

  const transcripts = attempts
    .filter((a) => (a.UserPromptResponses || []).length > 0)
    .map((attempt) => ({
      attempt_id: attempt.id,
      lesson: { id: attempt.CourseLesson?.id || null, title: attempt.CourseLesson?.title || null },
      course: { id: attempt.Course?.id || null, name: attempt.Course?.name || null },
      prompts: (attempt.UserPromptResponses || []).map((r) => ({
        prompt_number: r.prompt_number,
        transcript_text: r.transcript_text,
        submitted_at: r.submitted_at,
      })),
    }));

  return { transcripts };
};

module.exports = {
  getUsers,
  getUserDetail,
  getUserLessonReports,
  getUserTranscripts,
};
