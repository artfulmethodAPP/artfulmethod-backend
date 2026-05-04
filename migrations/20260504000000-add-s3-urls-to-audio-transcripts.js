"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Audio_Transcripts", "audio_s3_url", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "character_count",
    });

    await queryInterface.addColumn("Audio_Transcripts", "transcript_s3_url", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "audio_s3_url",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Audio_Transcripts", "audio_s3_url");
    await queryInterface.removeColumn("Audio_Transcripts", "transcript_s3_url");
  },
};
