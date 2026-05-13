"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User_Prompt_Responses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_lesson_attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "User_Lesson_Attempts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      prompt_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      audio_s3_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      transcript_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration_seconds: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      submitted_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("User_Prompt_Responses", ["user_lesson_attempt_id", "prompt_number"], {
      unique: true,
      name: "user_prompt_responses_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User_Prompt_Responses");
  },
};
