"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Audio_Transcripts", {
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
      transcript_text: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      duration_seconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      language: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      word_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      character_count: {
        type: Sequelize.INTEGER,
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

  async down(queryInterface) {
    await queryInterface.dropTable("Audio_Transcripts");
  },
};
