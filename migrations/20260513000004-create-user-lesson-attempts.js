"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User_Lesson_Attempts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      course_lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Course_Lessons",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("in_progress", "completed"),
        defaultValue: "in_progress",
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      report_s3_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("User_Lesson_Attempts", ["user_id", "course_lesson_id"], {
      unique: true,
      name: "user_lesson_attempts_unique",
    });

    await queryInterface.addIndex("User_Lesson_Attempts", ["user_id", "course_id"], {
      name: "user_lesson_attempts_course_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User_Lesson_Attempts");
  },
};
