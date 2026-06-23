"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserLessonAttempt = sequelize.define(
    "UserLessonAttempt",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("in_progress", "completed"),
        defaultValue: "in_progress",
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      report_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      report_json_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      report_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "User_Lesson_Attempts",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  UserLessonAttempt.associate = (models) => {
    UserLessonAttempt.belongsTo(models.User, { foreignKey: "user_id" });
    UserLessonAttempt.belongsTo(models.Course, { foreignKey: "course_id" });
    UserLessonAttempt.belongsTo(models.CourseLesson, { foreignKey: "course_lesson_id" });
    UserLessonAttempt.hasMany(models.UserPromptResponse, { foreignKey: "user_lesson_attempt_id" });
  };

  return UserLessonAttempt;
};
