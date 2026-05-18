"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "email_reports_enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: "home_base_course_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "email_reports_enabled");
  },
};
