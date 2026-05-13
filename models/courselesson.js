"use strict";

module.exports = (sequelize, DataTypes) => {
  const CourseLesson = sequelize.define(
    "CourseLesson",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
     
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "Course_Lessons",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    },
  );

  CourseLesson.associate = (models) => {
    CourseLesson.belongsTo(models.Course, { foreignKey: "course_id" });
    CourseLesson.hasOne(models.LessonContent, { foreignKey: "course_lesson_id" });
    CourseLesson.hasMany(models.UserLessonAttempt, { foreignKey: "course_lesson_id" });
  };

  return CourseLesson;
};
