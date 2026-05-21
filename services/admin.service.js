"use strict";

const { Op } = require("sequelize");
const {
  User,
  Course,
  UserCourseProgress,
  UserLessonAttempt,
} = require("../models");

const getUsers = async ({ page = 1, limit = 4, search, status }) => {
  const offset = (page - 1) * limit;

  // Build where clause
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
  // if status is omitted, return all (both active + deleted)

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: [
      "id",
      "name",
      "email",
      "role",
      "is_verified",
      "streak_count",
      "last_activity_date",
      "created_at",
      "deleted_at",
      "home_base_course_id",
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

module.exports = { getUsers };
