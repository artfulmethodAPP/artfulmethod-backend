"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Ai_Reports", "report_json", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "pdf_s3_key",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Ai_Reports", "report_json");
  },
};
