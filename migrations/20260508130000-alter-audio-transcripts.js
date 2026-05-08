"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Audio_Transcripts");

    if (tableDescription.audio_s3_url) {
      await queryInterface.removeColumn("Audio_Transcripts", "audio_s3_url");
    }

    if (tableDescription.transcript_s3_url) {
      await queryInterface.removeColumn("Audio_Transcripts", "transcript_s3_url");
    }

    if (!tableDescription.audio_s3_key) {
      await queryInterface.addColumn("Audio_Transcripts", "audio_s3_key", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Audio_Transcripts");

    if (tableDescription.audio_s3_key) {
      await queryInterface.removeColumn("Audio_Transcripts", "audio_s3_key");
    }

    if (!tableDescription.audio_s3_url) {
      await queryInterface.addColumn("Audio_Transcripts", "audio_s3_url", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!tableDescription.transcript_s3_url) {
      await queryInterface.addColumn("Audio_Transcripts", "transcript_s3_url", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },
};
