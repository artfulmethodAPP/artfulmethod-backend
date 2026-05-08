"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Ai_Reports");

    if (tableDescription.pdf_url) {
      await queryInterface.removeColumn("Ai_Reports", "pdf_url");
    }

    if (!tableDescription.pdf_s3_key) {
      await queryInterface.addColumn("Ai_Reports", "pdf_s3_key", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Ai_Reports");

    if (tableDescription.pdf_s3_key) {
      await queryInterface.removeColumn("Ai_Reports", "pdf_s3_key");
    }

    if (!tableDescription.pdf_url) {
      await queryInterface.addColumn("Ai_Reports", "pdf_url", {
        type: Sequelize.STRING(500),
        allowNull: true,
      });
    }
  },
};
