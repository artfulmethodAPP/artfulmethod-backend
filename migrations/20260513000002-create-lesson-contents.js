"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Lesson_Contents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      course_lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Course_Lessons",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      artwork_title: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      artwork_info: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      artist_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      years: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      prompts_json: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      image_s3_key: {
        type: Sequelize.TEXT,
        allowNull: false,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Lesson_Contents");
  },
};
