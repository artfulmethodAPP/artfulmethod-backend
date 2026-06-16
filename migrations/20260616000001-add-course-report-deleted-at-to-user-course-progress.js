"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "User_Course_Progress",
      "course_report_deleted_at",
      {
        type: Sequelize.DATE,
        allowNull: true,
        after: "course_report_json",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "User_Course_Progress",
      "course_report_deleted_at",
    );
  },
};
