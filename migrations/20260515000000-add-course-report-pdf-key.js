"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User_Course_Progress", "course_report_pdf_s3_key", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "course_report_s3_key",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("User_Course_Progress", "course_report_pdf_s3_key");
  },
};
