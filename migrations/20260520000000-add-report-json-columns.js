"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User_Lesson_Attempts", "report_json", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "report_json_s3_key",
    });

    await queryInterface.addColumn("User_Course_Progress", "course_report_json", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "course_report_s3_key",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("User_Lesson_Attempts", "report_json");
    await queryInterface.removeColumn("User_Course_Progress", "course_report_json");
  },
};
