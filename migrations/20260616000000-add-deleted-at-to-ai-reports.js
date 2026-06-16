"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Ai_Reports", "deleted_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "updated_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Ai_Reports", "deleted_at");
  },
};
