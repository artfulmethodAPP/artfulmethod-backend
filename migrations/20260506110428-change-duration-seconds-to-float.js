"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Audio_Transcripts", "duration_seconds", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Audio_Transcripts", "duration_seconds", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
