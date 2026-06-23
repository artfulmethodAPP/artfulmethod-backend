"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("User_Lesson_Attempts", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "report_json",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("User_Lesson_Attempts", "deleted_at");
  },
};
