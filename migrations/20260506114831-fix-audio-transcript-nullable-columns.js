"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Audio_Transcripts", "language", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.changeColumn("Audio_Transcripts", "word_count", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Audio_Transcripts", "language", {
      type: Sequelize.STRING(20),
      allowNull: false,
    });

    await queryInterface.changeColumn("Audio_Transcripts", "word_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
