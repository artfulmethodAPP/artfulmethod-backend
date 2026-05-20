"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserCourseProgress = sequelize.define(
    "UserCourseProgress",
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
      lessons_completed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("not_started", "in_progress", "completed"),
        defaultValue: "not_started",
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      course_report_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      course_report_pdf_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      course_report_json: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "User_Course_Progress",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  UserCourseProgress.associate = (models) => {
    UserCourseProgress.belongsTo(models.User, { foreignKey: "user_id" });
    UserCourseProgress.belongsTo(models.Course, { foreignKey: "course_id" });
  };

  return UserCourseProgress;
};
