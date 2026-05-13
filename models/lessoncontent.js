"use strict";

module.exports = (sequelize, DataTypes) => {
  const LessonContent = sequelize.define(
    "LessonContent",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      course_lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      artwork_title: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      artwork_info: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      artist_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      years: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      prompts_json: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      image_s3_key: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "Lesson_Contents",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  LessonContent.associate = (models) => {
    LessonContent.belongsTo(models.CourseLesson, { foreignKey: "course_lesson_id" });
  };

  return LessonContent;
};
