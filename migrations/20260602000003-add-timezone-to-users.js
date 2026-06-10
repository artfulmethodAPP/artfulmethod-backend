"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "timezone", {
      type: Sequelize.STRING(64),
      allowNull: false,
      defaultValue: "UTC",
      after: "last_activity_date",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "timezone");
  },
};
