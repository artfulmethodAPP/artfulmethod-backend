"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      goal: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      art_frequency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      streak_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_activity_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      otp_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      home_base_course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email_reports_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Users",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  User.associate = (models) => {
    User.hasMany(models.UserToken, { foreignKey: "user_id" });
    User.hasMany(models.Task, { foreignKey: "user_id" });
    User.hasMany(models.TaskAttempt, { foreignKey: "user_id" });
    User.hasMany(models.AudioTranscript, { foreignKey: "user_id" });
    User.hasMany(models.EmailLog, { foreignKey: "user_id" });
    User.hasMany(models.Archetype, {
      foreignKey: "created_by",
      as: "archetypes",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    User.hasMany(models.UserCourseProgress, { foreignKey: "user_id" });
    User.hasMany(models.UserLessonAttempt, { foreignKey: "user_id" });
    User.belongsTo(models.Course, { foreignKey: "home_base_course_id", as: "homeBaseCourse" });
  };

  return User;
};
